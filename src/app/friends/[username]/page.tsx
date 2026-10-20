import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FriendCollection } from "@/components/friend-collection";
import { releases } from "@/lib/catalog";
import { getOwnedCollectibleIds } from "@/lib/collection-store";
import { buildFriendCollection } from "@/lib/friend-collection";
import { areFriends } from "@/lib/friends-store";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getWishlistItemIds } from "@/lib/wishlist-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Friend collection · your hirono" };

export default async function FriendCollectionPage({ params }: { params: Promise<{ username: string }> }) {
  const session = await getSession();
  if (!session) redirect("/");
  const { username } = await params;
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(username)) notFound();
  if (username === session.username) redirect("/");
  if (!await areFriends(session.username, username)) notFound();

  const { data: friend, error } = await getSupabaseAdmin().from("accounts")
    .select("username, avatar_path").eq("username", username).maybeSingle();
  if (error) throw new Error("Unable to load this friend.");
  if (!friend) notFound();
  const [ownedIds, wishlistIds] = await Promise.all([
    getOwnedCollectibleIds(username),
    getWishlistItemIds(username),
  ]);
  const collection = buildFriendCollection(releases, ownedIds, wishlistIds);
  return <FriendCollection key={username} username={friend.username} avatarPath={friend.avatar_path} {...collection} />;
}
