import type { Category, Release } from "@/lib/catalog";

export type FriendCollectionView = "owned" | "wishlist";

export function buildFriendCollection(catalog: Release[], ownedIds: string[], wishlistIds: string[]) {
  const allIds = new Set(catalog.flatMap((release) => release.items.map((item) => item.id)));
  const releasedIds = new Set(catalog.filter((release) => release.status !== "upcoming").flatMap((release) => release.items.map((item) => item.id)));
  const owned = new Set(ownedIds.filter((id) => releasedIds.has(id)));
  const wishlist = new Set(wishlistIds.filter((id) => allIds.has(id)));
  const releases = catalog.flatMap((release) => {
    const items = release.items.filter((item) => owned.has(item.id) || wishlist.has(item.id));
    return items.length ? [{ ...release, items }] : [];
  });
  return { releases, ownedIds: [...owned], wishlistIds: [...wishlist], total: releasedIds.size };
}

export function filterFriendReleases(releases: Release[], savedIds: ReadonlySet<string>, query: string, category: "all" | Category, tag: "all" | "mixed-ip") {
  const normalizedQuery = query.trim().toLowerCase();
  return releases.flatMap((release) => {
    if (category !== "all" && release.category !== category) return [];
    if (tag !== "all" && !release.tags.includes(tag)) return [];
    const releaseText = [release.name, release.type, release.collaboration, release.description, release.tags.includes("mixed-ip") ? "mixed IP" : ""].filter(Boolean).join(" ").toLowerCase();
    const releaseMatches = !normalizedQuery || releaseText.includes(normalizedQuery);
    const visibleItems = release.items.filter((item) => savedIds.has(item.id) && (releaseMatches || item.name.toLowerCase().includes(normalizedQuery)));
    return visibleItems.length ? [{ ...release, visibleItems }] : [];
  });
}
