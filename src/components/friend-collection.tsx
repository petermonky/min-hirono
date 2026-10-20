"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Avatar } from "@/components/avatar";
import { ReleaseCard } from "@/components/collection-cards";
import { categoryOptions, FilterPill, FilterRail } from "@/components/collection-filters";
import type { CategoryFilter, TagFilter } from "@/components/collection-filters";
import { Icon } from "@/components/icon";
import type { Release } from "@/lib/catalog";
import { filterFriendReleases } from "@/lib/friend-collection";
import type { FriendCollectionView } from "@/lib/friend-collection";

type Props = { username: string; avatarPath: string | null; releases: Release[]; ownedIds: string[]; wishlistIds: string[]; total: number };

export function FriendCollection({ username, avatarPath, releases, ownedIds, wishlistIds, total }: Props) {
  const [view, setView] = useState<FriendCollectionView>("owned");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [tag, setTag] = useState<TagFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const owned = useMemo(() => new Set(ownedIds), [ownedIds]);
  const wishlist = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const savedIds = view === "owned" ? owned : wishlist;
  const visibleReleases = useMemo(() => filterFriendReleases(releases, savedIds, deferredQuery, category, tag), [releases, savedIds, deferredQuery, category, tag]);
  const yearGroups = useMemo(() => {
    const groups = new Map<number | "Date unknown", typeof visibleReleases>();
    for (const release of visibleReleases) {
      const year = release.year || "Date unknown";
      const group = groups.get(year) ?? [];
      group.push(release);
      groups.set(year, group);
    }
    return [...groups.entries()];
  }, [visibleReleases]);
  const percent = total ? Math.round(owned.size / total * 100) : 0;
  const filterCount = Number(category !== "all") + Number(tag !== "all");
  const hasFilters = Boolean(deferredQuery.trim()) || filterCount > 0;
  const shownItems = visibleReleases.reduce((count, release) => count + release.visibleItems.length, 0);
  const selectView = (next: FriendCollectionView) => { setView(next); setCollapsed(new Set()); };
  const clearFilters = () => { setQuery(""); setCategory("all"); setTag("all"); setCollapsed(new Set()); };

  return <>
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center px-5 md:px-8" aria-label="Primary navigation">
        <Link href="/" className="flex items-center" aria-label="your hirono home">
          <Image src="/brand/hirono-head.png" alt="" width={36} height={36} className="size-9 object-contain" priority />
        </Link>
      </nav>
    </header>
    <main className="mx-auto max-w-[1280px] px-5 pb-20 pt-6 md:px-8 md:pb-28 md:pt-8">
      <Link href="/friends" className="inline-flex h-11 items-center gap-3 text-[10px] font-bold uppercase" aria-label="Back to friends">
        <Icon name="arrow" className="size-4 rotate-180" />Friends
      </Link>

      <section className="flex items-center gap-5 py-10 md:py-12" aria-labelledby="friend-collection-title">
        <Avatar username={username} path={avatarPath} className="size-20 border border-hairline" iconClassName="size-8" />
        <div className="min-w-0 w-full max-w-md">
          <h1 id="friend-collection-title" className="display-sm break-words">{username}</h1>
          <div className="mb-3 mt-4 flex items-end justify-between gap-3 text-xs tabular-nums">
            <span className="text-secondary">{owned.size} / {total} collected</span>
            <strong className="font-semibold">{percent}%</strong>
          </div>
          <div className="progress-track" role="progressbar" aria-label={`${username} collection progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${owned.size} of ${total} collected`}>
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </section>

      <section aria-label="Friend collection">
        <div className="sticky top-16 z-30 -mx-5 mb-8 border-b border-hairline bg-canvas/95 px-5 py-3 backdrop-blur-md md:mx-0 md:px-4">
          <div className="mb-3 flex gap-2" role="group" aria-label="Collection view">
            <FilterPill active={view === "owned"} onClick={() => selectView("owned")}>Owned ({owned.size})</FilterPill>
            <FilterPill active={view === "wishlist"} onClick={() => selectView("wishlist")}>Wishlist ({wishlist.size})</FilterPill>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Icon name="search" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-secondary" />
              <label htmlFor="friend-search" className="sr-only">Search {username}’s collection</label>
              <input id="friend-search" type="search" value={query} placeholder="Search collection…" onChange={(event) => { setQuery(event.target.value); setCollapsed(new Set()); }} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }} className="h-11 w-full border border-hairline-strong bg-surface pl-12 pr-4 text-xs outline-none transition-colors placeholder:text-mute hover:border-ink focus:border-focus" />
            </div>
            <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} aria-controls="friend-filters" className={`chunky-button flex h-11 shrink-0 items-center gap-2 px-4 text-[10px] uppercase ${filtersOpen ? "bg-ink text-canvas" : "bg-surface text-ink"}`}>
              <Icon name="filter" />{filtersOpen ? "Done" : "Filters"}
              {!filtersOpen && filterCount > 0 && <span className="grid size-5 place-items-center bg-primary text-[9px] text-on-primary">{filterCount}</span>}
            </button>
          </div>
          <div id="friend-filters" className="mobile-filter-panel w-full min-w-0" data-open={filtersOpen} inert={!filtersOpen} aria-hidden={!filtersOpen}>
            <div className="mobile-filter-panel-inner">
              <div className="grid min-w-0 gap-5 border-t border-hairline pt-3">
                <div className="min-w-0">
                  <p className="mb-2 text-[9px] font-bold uppercase text-mute">Product type</p>
                  <FilterRail label="Filter by collection type">
                    {categoryOptions.map((option) => <FilterPill key={option.value} active={category === option.value} onClick={() => { setCategory(option.value); setCollapsed(new Set()); }}>{option.label}</FilterPill>)}
                  </FilterRail>
                </div>
                <div className="min-w-0">
                  <p className="mb-2 text-[9px] font-bold uppercase text-mute">Catalog tag</p>
                  <FilterRail label="Filter by catalog tag">
                    <FilterPill active={tag === "all"} onClick={() => { setTag("all"); setCollapsed(new Set()); }}>All</FilterPill>
                    <FilterPill active={tag === "mixed-ip"} onClick={() => { setTag("mixed-ip"); setCollapsed(new Set()); }}>Mixed IP</FilterPill>
                  </FilterRail>
                </div>
                {filterCount > 0 && <button type="button" onClick={clearFilters} className="mb-2 justify-self-start text-[10px] font-bold uppercase text-primary-strong">Clear filters</button>}
              </div>
            </div>
          </div>
        </div>

        <p className="mb-6 text-[10px] font-medium uppercase text-secondary" role="status">{visibleReleases.length} releases · {shownItems} collectibles</p>
        {yearGroups.length ? yearGroups.map(([year, group]) => (
          <section key={year} className="grid gap-6 py-8 first:pt-0 md:grid-cols-[74px_1fr] md:gap-10">
            <h2 className="border-t border-ink pt-3 text-center text-sm font-bold tabular-nums">{year}</h2>
            <div>
              {group.map((release) => <ReleaseCard key={release.id} mode="readonly" view={view} release={release} visibleItems={release.visibleItems} owned={owned} wishlist={wishlist} open={!collapsed.has(release.id)} onToggleOpen={() => setCollapsed((current) => {
                const next = new Set(current);
                if (next.has(release.id)) next.delete(release.id); else next.add(release.id);
                return next;
              })} />)}
            </div>
          </section>
        )) : <div className="grid min-h-64 place-items-center border border-hairline p-8 text-center">
          <div>
            <h2 className="title-text">{hasFilters ? "No matching items." : view === "owned" ? "No collected items yet." : "No wishlist items yet."}</h2>
            <p className="mt-2 text-xs text-secondary">{hasFilters ? "Try another search or loosen a filter." : view === "owned" ? `${username} hasn’t marked any items as collected yet.` : `${username} hasn’t added anything to their wishlist yet.`}</p>
            {hasFilters ? <button type="button" onClick={clearFilters} className="chunky-button mt-6 h-11 bg-ink px-5 text-[10px] uppercase text-canvas">Clear filters</button> : view === "owned" && wishlist.size > 0 && <button type="button" onClick={() => selectView("wishlist")} className="chunky-button mt-6 h-11 bg-ink px-5 text-[10px] uppercase text-canvas">View wishlist</button>}
          </div>
        </div>}
      </section>
    </main>
  </>;
}
