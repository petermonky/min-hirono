import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function getOwnedCollectibleIds() {
  const { data, error } = await getSupabaseAdmin()
    .from("collection_items")
    .select("item_id")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Unable to load the collection: ${error.message}`);
  return data.map(({ item_id }) => item_id as string);
}
export async function setCollectibleOwned(itemId: string, owned: boolean) {
  const client = getSupabaseAdmin();
  const operation = owned
    ? client.from("collection_items").upsert({ item_id: itemId, updated_at: new Date().toISOString() })
    : client.from("collection_items").delete().eq("item_id", itemId);
  const { error } = await operation;
  if (error) throw new Error(`Unable to update the collection: ${error.message}`);
}

export async function addOwnedCollectibles(itemIds: string[]) {
  if (!itemIds.length) return;
  const timestamp = new Date().toISOString();
  const { error } = await getSupabaseAdmin()
    .from("collection_items")
    .upsert(itemIds.map((itemId) => ({ item_id: itemId, updated_at: timestamp })));
  if (error) throw new Error(`Unable to migrate the collection: ${error.message}`);
}

export async function removeOwnedCollectibles(itemIds?: string[]) {
  const query = getSupabaseAdmin().from("collection_items").delete();
  const { error } = itemIds
    ? await query.in("item_id", itemIds)
    : await query.neq("item_id", "");
  if (error) throw new Error(`Unable to clear the collection: ${error.message}`);
}
