import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function getWishlistItemIds(username: string) {
  const { data, error } = await getSupabaseAdmin().from("wishlist_items")
    .select("item_id").eq("account_username", username).order("created_at");
  if (error) throw new Error(`Unable to load wishlist: ${error.message}`);
  return data.map(({ item_id }) => item_id as string);
}

export async function setItemWishlisted(username: string, itemId: string, wishlisted: boolean) {
  const table = getSupabaseAdmin().from("wishlist_items");
  const { error } = wishlisted
    ? await table.upsert({ account_username: username, item_id: itemId }, { onConflict: "account_username,item_id" })
    : await table.delete().eq("account_username", username).eq("item_id", itemId);
  if (error) throw new Error(`Unable to update wishlist: ${error.message}`);
}
