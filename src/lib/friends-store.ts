import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { allReleasedItemIds } from "@/lib/catalog";

export type Friend = { username: string; avatar_path: string | null; ownedCount: number };

export async function areFriends(username: string, otherUsername: string) {
  if (username === otherUsername) return false;
  const [a, b] = [username, otherUsername].sort();
  const { data, error } = await getSupabaseAdmin().from("friendships")
    .select("username_a").eq("username_a", a).eq("username_b", b).maybeSingle();
  if (error) throw new Error(`Unable to check friendship: ${error.message}`);
  return Boolean(data);
}

export async function getFriends(username: string) {
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
  if (!friendIds.length) return [];
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
