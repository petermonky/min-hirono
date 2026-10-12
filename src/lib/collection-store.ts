import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function getOwnedCollectibleIds(username: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("collection_items")
    .select("item_id")
    .eq("account_username", username)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Unable to load the collection: ${error.message}`);
  return data.map(({ item_id }) => item_id as string);
}
export async function setCollectibleOwned(username: string, itemId: string, owned: boolean) {
  const client = getSupabaseAdmin();
  const operation = owned
    ? client.from("collection_items").upsert(
      { account_username: username, item_id: itemId, updated_at: new Date().toISOString() },
      { onConflict: "account_username,item_id" },
    )
    : client.from("collection_items").delete().eq("account_username", username).eq("item_id", itemId);
  const { error } = await operation;
  if (error) throw new Error(`Unable to update the collection: ${error.message}`);
}

export async function addOwnedCollectibles(username: string, itemIds: string[]) {
  if (!itemIds.length) return;
  const timestamp = new Date().toISOString();
  const { error } = await getSupabaseAdmin()
    .from("collection_items")
    .upsert(
      itemIds.map((itemId) => ({ account_username: username, item_id: itemId, updated_at: timestamp })),
      { onConflict: "account_username,item_id" },
    );
  if (error) throw new Error(`Unable to migrate the collection: ${error.message}`);
}

export async function removeOwnedCollectibles(username: string, itemIds?: string[]) {
  const query = getSupabaseAdmin().from("collection_items").delete().eq("account_username", username);
  const { error } = itemIds
    ? await query.in("item_id", itemIds)
    : await query.neq("item_id", "");
  if (error) throw new Error(`Unable to clear the collection: ${error.message}`);
}
