import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { allReleasedItemIds } from "@/lib/catalog";

export type Friend = { username: string; avatar_path: string | null; ownedCount: number };

// Everyone is connected by default; the account directory is the friends list.
export async function getFriends() {
  const friends: Omit<Friend, "ownedCount">[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await getSupabaseAdmin().from("accounts")
      .select("username, avatar_path").order("username").range(offset, offset + pageSize - 1);
    if (error) throw new Error(`Unable to load friends: ${error.message}`);
    friends.push(...data);
    if (data.length < pageSize) break;
  }

  // Aggregate in pages rather than issuing a collection query for every friend.
  const counts = new Map<string, number>();
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await getSupabaseAdmin().from("collection_items")
      .select("account_username, item_id").order("account_username").order("item_id")
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(`Unable to load friends’ progress: ${error.message}`);
    for (const item of data) {
      if (allReleasedItemIds.has(item.item_id)) {
        counts.set(item.account_username, (counts.get(item.account_username) ?? 0) + 1);
      }
    }
    if (data.length < pageSize) break;
  }
  return friends.map((friend) => ({ ...friend, ownedCount: counts.get(friend.username) ?? 0 }));
}
