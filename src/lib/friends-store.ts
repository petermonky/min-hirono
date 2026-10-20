import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { allReleasedItemIds } from "@/lib/catalog";

export type Friend = { username: string; avatar_path: string | null; ownedCount: number };
export type FriendInvite = Friend & { id: string };
export type UserSearchResult = Friend & { relationship: "friend" | "incoming" | "outgoing" | "none" };
export type FriendsDirectoryData = { friends: Friend[]; invitations: FriendInvite[] };

export async function areFriends(username: string, otherUsername: string) {
  if (username === otherUsername) return false;
  const [a, b] = [username, otherUsername].sort();
  const { data, error } = await getSupabaseAdmin().from("friendships")
    .select("username_a").eq("username_a", a).eq("username_b", b).maybeSingle();
  if (error) throw new Error(`Unable to check friendship: ${error.message}`);
  return Boolean(data);
}

async function getFriendIds(username: string) {
  const client = getSupabaseAdmin();
  const friendIds: string[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from("friendships").select("username_a, username_b")
      .or(`username_a.eq.${username},username_b.eq.${username}`)
      .order("username_a").order("username_b").range(offset, offset + pageSize - 1);
    if (error) throw new Error(`Unable to load friendships: ${error.message}`);
    friendIds.push(...data.map((edge) => edge.username_a === username ? edge.username_b : edge.username_a));
    if (data.length < pageSize) break;
  }
  return friendIds;
}

async function getProfilesWithProgress(friendIds: string[]) {
  if (!friendIds.length) return [];
  const client = getSupabaseAdmin();
  const pageSize = 1000;
  const friends: Omit<Friend, "ownedCount">[] = [];
  const counts = new Map<string, number>();
  // Bound query sizes and fetch only connected accounts and their collection rows.
  for (let start = 0; start < friendIds.length; start += 200) {
    const batch = friendIds.slice(start, start + 200);
    const { data: accounts, error: accountError } = await client.from("accounts")
      .select("username, avatar_path").in("username", batch);
    if (accountError) throw new Error(`Unable to load friends: ${accountError.message}`);
    friends.push(...accounts);
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await client.from("collection_items")
        .select("account_username, item_id").in("account_username", batch)
        .order("account_username").order("item_id").range(offset, offset + pageSize - 1);
      if (error) throw new Error(`Unable to load friends’ progress: ${error.message}`);
      for (const item of data) {
        if (allReleasedItemIds.has(item.item_id)) {
          counts.set(item.account_username, (counts.get(item.account_username) ?? 0) + 1);
        }
      }
      if (data.length < pageSize) break;
    }
  }
  return friends.sort((a, b) => a.username.localeCompare(b.username))
    .map((friend) => ({ ...friend, ownedCount: counts.get(friend.username) ?? 0 }));
}

export async function getFriends(username: string) {
  return getProfilesWithProgress(await getFriendIds(username));
}

async function getInviteEdges(username: string) {
  const invitations: Array<{ id: string; sender_username: string; recipient_username: string }> = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await getSupabaseAdmin().from("friend_invites")
      .select("id, sender_username, recipient_username")
      .or(`sender_username.eq.${username},recipient_username.eq.${username}`)
      .order("created_at").order("id").range(offset, offset + 999);
    if (error) throw new Error(`Unable to load friend invites: ${error.message}`);
    invitations.push(...data);
    if (data.length < 1000) return invitations;
  }
}

export async function getFriendsDirectory(username: string): Promise<FriendsDirectoryData> {
  const [friends, edges] = await Promise.all([getFriends(username), getInviteEdges(username)]);
  const incoming = edges.filter((edge) => edge.recipient_username === username);
  const profiles = await getProfilesWithProgress(incoming.map((edge) => edge.sender_username));
  const invitations = incoming.flatMap((edge) => {
    const profile = profiles.find((person) => person.username === edge.sender_username);
    return profile ? [{ ...profile, id: edge.id }] : [];
  });
  return { friends, invitations };
}

export async function searchUsers(username: string, query: string): Promise<UserSearchResult[]> {
  const { data, error } = await getSupabaseAdmin().from("accounts").select("username")
    .neq("username", username).eq("username", query.trim().toLowerCase()).limit(1);
  if (error) throw new Error(`Unable to search users: ${error.message}`);
  if (!data.length) return [];
  const [profiles, friendIds, invitations] = await Promise.all([
    getProfilesWithProgress(data.map((person) => person.username)), getFriendIds(username), getInviteEdges(username),
  ]);
  const friends = new Set(friendIds);
  return profiles.map((person) => ({
    ...person,
    relationship: friends.has(person.username) ? "friend"
      : invitations.some((edge) => edge.sender_username === person.username) ? "incoming"
      : invitations.some((edge) => edge.recipient_username === person.username) ? "outgoing" : "none",
  }));
}
