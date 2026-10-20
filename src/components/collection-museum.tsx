"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyboardEvent, memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { Avatar } from "@/components/avatar";
import { ChangelogModal } from "@/components/changelog-modal";
import type { Category, CollectibleItem, Release } from "@/lib/catalog";

const STORAGE_KEY = "hironoCollectionV2";
const releaseDateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

type OwnershipFilter = "all" | "owned" | "missing" | "wishlist";
type CategoryFilter = "all" | Category;
type TagFilter = "all" | "mixed-ip";
type Confirmation = { title: string; body: string; actionLabel: string; action: () => void } | null;

const categoryOptions: Array<{ value: CategoryFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "figures", label: "Figures" },
  { value: "plush", label: "Plush" },
  { value: "accessories", label: "Accessories" },
  { value: "collaborations", label: "Collaborations" },
];

const ownershipOptions: Array<{ value: OwnershipFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "owned", label: "Owned" },
  { value: "missing", label: "Missing" },
  { value: "wishlist", label: "Wishlist" },
];

function ArtworkPlaceholder({ name }: { name: string }) {
  return (
    <span className="absolute inset-0 grid place-items-center bg-surface px-4 text-center">
      <span>
        <span className="block text-[10px] font-medium text-mute">your hirono</span>
        <span className="mt-1 block text-xs text-secondary">Image unavailable</span>
        <span className="sr-only"> for {name}</span>
      </span>
    </span>
  );
}

function MuseumImage({ item, sizes, priority = false, className = "object-cover" }: {
  item: CollectibleItem;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!item.image.src || failed) return <ArtworkPlaceholder name={item.name} />;
  return (
    <Image
      src={item.image.src}
      alt={item.image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function ReleaseCover({ release }: { release: Release }) {
  const item = release.items[0];
  const sources = [release.coverImage, item.image.src].filter((source): source is string => Boolean(source));
  const [sourceIndex, setSourceIndex] = useState(0);
  if (!sources[sourceIndex]) return <ArtworkPlaceholder name={release.name} />;
  return (
    <Image
      src={sources[sourceIndex]}
      alt={`${release.name} collection`}
      fill
      sizes="(max-width: 768px) 96px, 176px"
      className="release-cover-image object-cover"
      onError={() => setSourceIndex((current) => current + 1)}
    />
  );
}

function formatDate(date: string) {
  return releaseDateFormatter.format(new Date(`${date}T12:00:00`));
}

function sourceLabel(release: Release) {
  if (release.sourceKind === "official-archive") return "Official POP MART archive";
  return "Official POP MART";
}

function parseOwned(raw: string | null, validIds: Set<string>) {
  try {
    const payload = JSON.parse(raw || "{}");
    const ids: string[] = Array.isArray(payload.owned)
      ? payload.owned
      : Object.entries(payload.owned || {}).filter(([, value]) => value).map(([id]) => id);
    return new Set(ids.filter((id) => validIds.has(id)));
  } catch {
    return new Set<string>();
  }
}

function FilterPill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chunky-button flex h-11 min-w-[92px] shrink-0 items-center justify-center px-4 text-[11px] uppercase ${
        active ? "border-ink bg-ink text-canvas" : "border-hairline-strong bg-surface text-body hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function FilterRail({ label, children }: { label: string; children: React.ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const updateEdges = () => {
      setCanScrollLeft(rail.scrollLeft > 1);
      setCanScrollRight(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1);
    };
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(rail);
    window.addEventListener("resize", updateEdges);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <span className={`filter-rail-fade filter-rail-fade-left ${canScrollLeft ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
      <div ref={railRef} onScroll={() => {
        const rail = railRef.current;
        if (!rail) return;
        setCanScrollLeft(rail.scrollLeft > 1);
        setCanScrollRight(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1);
      }} className="no-scrollbar flex w-full min-w-0 gap-2 overflow-x-auto overflow-y-hidden pb-1" aria-label={label}>
        {children}
      </div>
      <span className={`filter-rail-fade filter-rail-fade-right ${canScrollRight ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
    </div>
  );
}

const ItemCard = memo(function ItemCard({ item, owned, disabled, pending, wishlisted, wishlistPending, onToggle, onToggleWishlist }: {
  item: CollectibleItem;
  owned: boolean;
  disabled: boolean;
  pending: boolean;
  wishlisted: boolean;
  wishlistPending: boolean;
  onToggle: (id: string) => void;
  onToggleWishlist: (id: string) => void;
}) {
  const [justToggled, setJustToggled] = useState(false);

  const handleClick = () => {
    onToggle(item.id);
    setJustToggled(true);
    window.setTimeout(() => setJustToggled(false), 300);
  };

  return (
    <div className="relative min-w-0">
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      aria-pressed={owned}
      aria-label={`${item.name} — ${disabled ? "coming soon" : pending ? "saving" : owned ? "owned, mark as missing" : "missing, mark as owned"}`}
      className={`store-grid-card group w-full min-w-0 text-left ${justToggled ? "item-enter" : ""}`}
    >
      <span className={`collectible-frame relative block aspect-square overflow-hidden bg-canvas-soft transition-all duration-200 ease-museum ${
        owned ? "border-ink" : "group-hover:border-hairline-strong"
      }`}>
        {item.rarity !== "standard" && (
          <span className="absolute left-0 top-0 z-10 bg-ink px-2 py-1.5 text-[9px] font-bold uppercase text-white">
            {item.rarity === "secret" ? "✦ Secret" : "Special"}
          </span>
        )}
        {item.odds && <span className="absolute bottom-0 left-0 z-10 bg-canvas px-2 py-1.5 text-[9px] font-semibold text-secondary">{item.odds}</span>}
        <span className={`store-grid-image absolute inset-0 transition-[opacity,filter] duration-200 ${owned ? "opacity-100" : "opacity-50 grayscale-[40%] group-hover:opacity-70"}`}>
          <MuseumImage item={item} sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 190px" />
        </span>
      </span>
      <span className="mt-3 block truncate text-xs font-semibold text-ink">{item.name}</span>
    </button>
      <button
        type="button"
        onClick={() => onToggleWishlist(item.id)}
        disabled={wishlistPending}
        aria-pressed={wishlisted}
        aria-label={`${wishlisted ? "Remove" : "Add"} ${item.name} ${wishlisted ? "from" : "to"} wishlist`}
        aria-busy={wishlistPending}
        className={`absolute right-0 top-0 z-20 grid size-11 place-items-center ${wishlisted ? "text-primary" : "text-mute"}`}
      >
        <Icon name="heart" className={`size-6 stroke-[1.2] transition-[fill,stroke,color] duration-150 ${wishlisted ? "fill-primary stroke-primary" : "fill-mute/55 stroke-hairline-strong/60"}`} />
      </button>
    </div>
  );
});

function ReleaseCard({ release, visibleItems, owned, pendingItemIds, wishlist, pendingWishlistIds, open, filteredOpen, onToggleOpen, onToggleItem, onToggleWishlist, onClear }: {
  release: Release;
  visibleItems: CollectibleItem[];
  owned: Set<string>;
  pendingItemIds: Set<string>;
  wishlist: Set<string>;
  pendingWishlistIds: Set<string>;
  open: boolean;
  filteredOpen: boolean;
  onToggleOpen: () => void;
  onToggleItem: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onClear: () => void;
}) {
  const ownedCount = release.items.filter((item) => owned.has(item.id)).length;
  const percent = Math.round((ownedCount / release.items.length) * 100);
  const upcoming = release.status === "upcoming";
  const complete = !upcoming && percent === 100;

  return (
    <article id={`release-card-${release.id}`} className="release-block border-t border-hairline py-8">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        aria-controls={`release-${release.id}`}
        className="grid w-full grid-cols-[120px_minmax(0,1fr)] gap-4 text-left md:grid-cols-[180px_minmax(0,1fr)_220px] md:gap-8"
      >
        <span className="relative row-span-2 aspect-square self-center overflow-hidden bg-canvas-soft md:row-span-1">
          <ReleaseCover release={release} />
        </span>
        <span className="min-w-0 self-center">
          <span className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase text-secondary">
            <span>{release.type}</span><span aria-hidden="true">·</span>
            {release.releaseDate ? <time dateTime={release.releaseDate}>{formatDate(release.releaseDate)}</time> : <span>{release.year || "Date unknown"}</span>}
            {release.collaboration && <span className="bg-secondary px-2 py-1 text-[9px] font-bold text-white">Collaboration</span>}
            {release.tags.includes("mixed-ip") && <span className="bg-ink px-2 py-1 text-[9px] font-bold text-white">Mixed IP</span>}
            {upcoming && <span className="bg-primary px-2 py-1 text-[9px] font-bold text-on-primary">Coming soon</span>}
          </span>
          <h3 className="title-text text-pretty">{release.name}</h3>
        </span>
        <span className="col-start-2 self-center md:col-start-3">
          <span className="mb-3 flex items-end justify-between text-xs">
            <span className="text-secondary">{upcoming ? "Not counted yet" : `${ownedCount} / ${release.items.length} collected`}</span>
            <strong className="font-semibold text-ink">{upcoming ? "—" : complete ? "Complete" : `${percent}%`}</strong>
          </span>
          <span className="progress-track block" aria-hidden="true">
            <span className="progress-fill block transition-[width] duration-300 ease-museum" style={{ width: `${upcoming ? 0 : percent}%` }} />
          </span>
          <span className="mt-3 flex items-center justify-end gap-1 text-[10px] font-semibold text-ink">
            {open ? "Collapse" : "Expand"}
            <Icon name="chevron" className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </span>
        </span>
      </button>

      <div id={`release-${release.id}`} className="release-panel md:ml-[212px]" data-open={open} inert={!open} aria-hidden={!open}>
        <div className="release-panel-inner">
          <div className="border-t border-hairline pt-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] font-medium uppercase text-mute">{visibleItems.length} {visibleItems.length === 1 ? "collectible" : "collectibles"} shown</p>
              <div className="flex items-center gap-4 text-[10px] font-semibold">
                {release.sourceUrl && <a href={release.sourceUrl} target="_blank" rel="noreferrer" className="text-secondary underline decoration-hairline-strong underline-offset-4 hover:text-ink">{sourceLabel(release)}</a>}
                {ownedCount > 0 && !upcoming && <button type="button" onClick={onClear} className="text-secondary hover:text-error">Clear release</button>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {visibleItems.map((item) => (
                <ItemCard key={item.id} item={item} owned={owned.has(item.id)} disabled={upcoming} pending={pendingItemIds.has(item.id)} wishlisted={wishlist.has(item.id)} wishlistPending={pendingWishlistIds.has(item.id)} onToggle={onToggleItem} onToggleWishlist={onToggleWishlist} />
              ))}
            </div>
            {filteredOpen && <p className="mt-8 border-t border-hairline pt-4 text-xs text-mute">This release is expanded while filters are active.</p>}
          </div>
        </div>
      </div>
    </article>
  );
}

export function CollectionMuseum({ releases, initialOwned, initialWishlist, username, avatarPath }: { releases: Release[]; initialOwned: string[]; initialWishlist: string[]; username: string; avatarPath: string | null }) {
  const router = useRouter();
  const validIds = useMemo(() => new Set(releases.filter((release) => release.status !== "upcoming").flatMap((release) => release.items.map((item) => item.id))), [releases]);
  const [owned, setOwned] = useState(() => new Set(initialOwned.filter((id) => validIds.has(id))));
  const [pendingItemIds, setPendingItemIds] = useState<Set<string>>(new Set());
  const [wishlist, setWishlist] = useState(() => new Set(initialWishlist));
  const wishlistRef = useRef(new Set(initialWishlist));
  const wishlistRequests = useRef(new Set<string>());
  const wishlistVersion = useRef(0);
  const [pendingWishlistIds, setPendingWishlistIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [ownership, setOwnership] = useState<OwnershipFilter>("all");
  const [tag, setTag] = useState<TagFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [toast, setToast] = useState("");
  const [showHeaderProgress, setShowHeaderProgress] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountCanHover, setAccountCanHover] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [hoveredAccountAction, setHoveredAccountAction] = useState<"changelog" | "logout" | "settings" | "friends" | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const progressSectionRef = useRef<HTMLElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest("dialog")) return;
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateInputMode = () => {
      setAccountCanHover(hoverQuery.matches);
      setAccountOpen(false);
      setHoveredAccountAction(null);
    };
    updateInputMode();
    hoverQuery.addEventListener("change", updateInputMode);
    return () => hoverQuery.removeEventListener("change", updateInputMode);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const closeOnScroll = () => {
      if (!accountCanHover) setAccountOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("scroll", closeOnScroll);
    };
  }, [accountCanHover, accountOpen]);

  useEffect(() => {
    if (confirmation) dialogRef.current?.showModal();
    else if (dialogRef.current?.open) dialogRef.current.close();
  }, [confirmation]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const progressSection = progressSectionRef.current;
    if (!progressSection) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowHeaderProgress(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(progressSection);
    return () => observer.disconnect();
  }, []);

  const refreshCollection = useCallback(async () => {
    const response = await fetch("/api/collection", { cache: "no-store" });
    if (response.status === 401) {
      router.refresh();
      return;
    }
    if (!response.ok) throw new Error();
    const payload = await response.json();
    setOwned(new Set((payload.owned as string[]).filter((id) => validIds.has(id))));
  }, [router, validIds]);

  const refreshWishlist = useCallback(async () => {
    if (wishlistRequests.current.size) return;
    const version = wishlistVersion.current;
    const response = await fetch("/api/wishlist", { cache: "no-store" });
    if (response.status === 401) { router.refresh(); return; }
    if (!response.ok) throw new Error("Wishlist refresh failed");
    const payload = await response.json();
    if (version !== wishlistVersion.current || wishlistRequests.current.size) return;
    wishlistRef.current = new Set(payload.wishlist as string[]);
    setWishlist(new Set(wishlistRef.current));
  }, [router]);

  const toggleWishlist = useCallback((id: string) => {
    if (wishlistRequests.current.has(id)) return;
    const wishlisted = !wishlistRef.current.has(id);
    wishlistRequests.current.add(id);
    wishlistVersion.current += 1;
    if (wishlisted) wishlistRef.current.add(id);
    else wishlistRef.current.delete(id);
    setWishlist(new Set(wishlistRef.current));
    setPendingWishlistIds(new Set(wishlistRequests.current));

    void fetch("/api/wishlist", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId: id, wishlisted }),
    }).then((response) => {
      if (response.status === 401) router.refresh();
      if (!response.ok) throw new Error("Wishlist update failed");
    }).catch(() => {
      if (wishlisted) wishlistRef.current.delete(id);
      else wishlistRef.current.add(id);
      setWishlist(new Set(wishlistRef.current));
      setToast("Could not update your wishlist");
    }).finally(() => {
      wishlistRequests.current.delete(id);
      wishlistVersion.current += 1;
      setPendingWishlistIds(new Set(wishlistRequests.current));
    });
  }, [router]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshCollection().catch(() => setToast("Could not refresh the collection"));
        void refreshWishlist().catch(() => setToast("Could not refresh the wishlist"));
      }
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshCollection, refreshWishlist]);

  useEffect(() => {
    const localOwned = parseOwned(localStorage.getItem(STORAGE_KEY), validIds);
    if (!localOwned.size) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    let cancelled = false;
    void fetch("/api/collection", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ owned: [...localOwned] }),
    }).then(async (response) => {
      if (!response.ok) throw new Error();
      const payload = await response.json();
      if (!cancelled) {
        setOwned(new Set((payload.owned as string[]).filter((id) => validIds.has(id))));
        setToast("Saved collection moved to Supabase");
      }
      localStorage.removeItem(STORAGE_KEY);
    }).catch(() => {
      if (!cancelled) setToast("Could not move the saved collection yet");
    });

    return () => { cancelled = true; };
  }, [validIds]);

  const toggleItem = useCallback((id: string) => {
    if (pendingItemIds.has(id)) return;
    const shouldOwn = !owned.has(id);
    setOwned((current) => {
      const next = new Set(current);
      if (shouldOwn) next.add(id);
      else next.delete(id);
      return next;
    });
    setPendingItemIds((current) => new Set(current).add(id));

    void fetch("/api/collection", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId: id, owned: shouldOwn }),
    }).then((response) => {
      if (response.status === 401) router.refresh();
      if (!response.ok) throw new Error();
    }).catch(() => {
      void refreshCollection().catch(() => undefined);
      setToast("Could not save that collectible");
    }).finally(() => {
      setPendingItemIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    });
  }, [owned, pendingItemIds, refreshCollection, router]);

  const removeItems = async (itemIds?: string[]) => {
    const previous = new Set(owned);
    setOwned((current) => {
      if (!itemIds) return new Set();
      const next = new Set(current);
      itemIds.forEach((id) => next.delete(id));
      return next;
    });
    try {
      const response = await fetch("/api/collection", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(itemIds ? { itemIds } : { all: true }),
      });
      if (response.status === 401) router.refresh();
      if (!response.ok) throw new Error();
    } catch {
      setOwned(previous);
      setToast("Could not clear the collection");
      throw new Error("Collection update failed");
    }
  };

  const lockArchive = async () => {
    setAccountOpen(false);
    await fetch("/api/session", { method: "DELETE" });
    router.refresh();
  };

  const released = releases.filter((release) => release.status !== "upcoming");
  const total = released.reduce((sum, release) => sum + release.items.length, 0);
  const ownedCount = [...owned].filter((id) => validIds.has(id)).length;
  const overallPercent = Math.round((ownedCount / total) * 100) || 0;

  const searchIndex = useMemo(() => new Map(releases.map((release) => [release.id, {
    releaseText: [release.name, release.type, release.collaboration, release.description, release.tags.includes("mixed-ip") ? "mixed IP" : null]
      .filter(Boolean).join(" ").toLowerCase(),
    itemText: new Map(release.items.map((item) => [item.id, item.name.toLowerCase()])),
  }])), [releases]);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const searchActive = Boolean(normalizedQuery);

  const visibleReleases = useMemo(() => {
    return releases.flatMap((release) => {
      if (category !== "all" && release.category !== category) return [];
      if (tag !== "all" && !release.tags.includes(tag)) return [];
      const indexedRelease = searchIndex.get(release.id);
      const releaseMatches = !normalizedQuery || indexedRelease?.releaseText.includes(normalizedQuery);
      const visibleItems = release.items.filter((item) => {
        if (normalizedQuery && !releaseMatches && !indexedRelease?.itemText.get(item.id)?.includes(normalizedQuery)) return false;
        if (ownership === "owned" && !owned.has(item.id)) return false;
        if (ownership === "missing" && owned.has(item.id)) return false;
        if (ownership === "wishlist" && !wishlist.has(item.id)) return false;
        return true;
      });
      return visibleItems.length ? [{ ...release, visibleItems }] : [];
    });
  }, [category, normalizedQuery, owned, ownership, releases, searchIndex, tag, wishlist]);

  const yearGroups = useMemo(() => {
    const groups = new Map<number | "Date unknown", Array<Release & { visibleItems: CollectibleItem[] }>>();
    visibleReleases.forEach((release) => {
      const key = release.year || "Date unknown";
      groups.set(key, [...(groups.get(key) || []), release]);
    });
    return [...groups.entries()];
  }, [visibleReleases]);

  const filtersActive = searchActive || category !== "all" || ownership !== "all" || tag !== "all";
  const filterCount = Number(category !== "all") + Number(ownership !== "all") + Number(tag !== "all");
  const shownItems = visibleReleases.reduce((sum, release) => sum + release.visibleItems.length, 0);

  const clearRelease = (release: Release) => setConfirmation({
    title: `Clear ${release.name}?`,
    body: `All ${release.items.length} collectibles in this release will be marked missing.`,
    actionLabel: "Clear release",
    action: () => {
      void removeItems(release.items.map((item) => item.id))
        .then(() => setToast(`${release.name} cleared`))
        .catch(() => undefined);
    },
  });

  const reset = () => setConfirmation({
    title: "Reset your entire collection?",
    body: "Every collectible will be marked missing. This cannot be undone.",
    actionLabel: "Reset everything",
    action: () => {
      void removeItems()
        .then(() => setToast("Collection reset"))
        .catch(() => undefined);
    },
  });

  const clearFilters = () => { setQuery(""); setCategory("all"); setOwnership("all"); setTag("all"); setFiltersOpen(false); };

  return (
    <>
      <a href="#catalog" className="chunky-button fixed left-4 top-4 z-50 -translate-y-24 bg-canvas px-4 py-3 text-xs text-ink focus:translate-y-0">Skip to collection</a>
      <header className="sticky top-0 z-40 bg-canvas">
        <nav className="border-b border-hairline" aria-label="Primary navigation">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 md:px-8">
            <a href="#top" onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
            }} className="flex items-center" aria-label="your hirono home">
              <Image src="/brand/hirono-head.png" alt="" width={36} height={36} className="size-9 object-contain" priority />
            </a>
            <div
              className={`w-[calc(100vw-176px)] transition-all duration-200 ease-museum md:w-[220px] ${showHeaderProgress ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
              aria-hidden={!showHeaderProgress}
              aria-label={`Collection progress: ${ownedCount} of ${total}, ${overallPercent}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={overallPercent}
              role="progressbar"
            >
              <div className="mb-3 flex items-end justify-between text-xs tabular-nums">
                <span className="text-secondary">{ownedCount} / {total} collected</span>
                <strong className="font-semibold text-ink">{overallPercent}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill transition-[width] duration-300 ease-museum" style={{ width: `${overallPercent}%` }} />
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main id="top">
        <section ref={progressSectionRef} className="border-y border-hairline bg-canvas-soft">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-[88px] md:grid-cols-[1fr_auto] md:items-end md:px-8 md:py-[120px]">
            <div>
              <div className="flex items-end gap-4">
                <p className="display-lg tabular-nums">{ownedCount}<span className="text-mute">/{total}</span></p>
                <p className="mb-1 text-xs text-secondary">collectibles found</p>
              </div>
              <div className="progress-track mt-6 max-w-[760px]">
                <div className="progress-fill transition-[width] duration-300 ease-museum" style={{ width: `${overallPercent}%` }} />
              </div>
            </div>
            <p className="display-sm tabular-nums">{overallPercent}%</p>
          </div>
        </section>

        <section id="catalog" className="mx-auto max-w-[1280px] px-5 pb-20 pt-0 md:px-8 md:pb-28">
          <div className="sticky top-16 z-30 -mx-5 mb-14 border-b border-hairline bg-canvas/95 px-5 py-3 backdrop-blur-md md:mx-0 md:px-4">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Icon name="search" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-secondary" />
                <label htmlFor="collection-search" className="sr-only">Search collection</label>
                <input
                  id="collection-search"
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => { if (event.key === "Escape") setQuery(""); }}
                  type="search"
                  placeholder="Search collection…"
                  className="h-11 w-full border border-hairline-strong bg-surface pl-12 pr-4 text-xs outline-none transition-colors placeholder:text-mute hover:border-ink focus:border-focus"
                />
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                aria-expanded={filtersOpen}
                aria-controls="catalog-filters"
                className={`chunky-button flex h-11 shrink-0 items-center gap-2 px-4 text-[10px] uppercase ${filtersOpen ? "bg-ink text-canvas" : "bg-surface text-ink"}`}
              >
                <Icon name="filter" />
                {filtersOpen ? "Done" : "Filters"}
                {!filtersOpen && filterCount > 0 && <span className="grid size-5 place-items-center bg-primary text-[9px] text-on-primary">{filterCount}</span>}
              </button>

            </div>

            <div id="catalog-filters" className="mobile-filter-panel w-full min-w-0" data-open={filtersOpen} inert={!filtersOpen} aria-hidden={!filtersOpen}>
              <div className="mobile-filter-panel-inner">
                <div className="grid min-w-0 gap-5 border-t border-hairline pt-3">
                  <div className="min-w-0">
                    <p className="mb-2 text-[9px] font-bold uppercase text-mute">Product type</p>
                    <FilterRail label="Filter by collection type">
                      {categoryOptions.map((option) => <FilterPill key={option.value} active={category === option.value} onClick={() => setCategory(option.value)}>{option.label}</FilterPill>)}
                    </FilterRail>
                  </div>
                  <div className="min-w-0">
                    <p className="mb-2 text-[9px] font-bold uppercase text-mute">Catalog tag</p>
                    <FilterRail label="Filter by catalog tag">
                      <FilterPill active={tag === "all"} onClick={() => setTag("all")}>All</FilterPill>
                      <FilterPill active={tag === "mixed-ip"} onClick={() => setTag("mixed-ip")}>Mixed IP</FilterPill>
                    </FilterRail>
                  </div>
                  <div className="min-w-0">
                    <p className="mb-2 text-[9px] font-bold uppercase text-mute">Collection</p>
                    <FilterRail label="Filter by collection status">
                      {ownershipOptions.map((option) => <FilterPill key={option.value} active={ownership === option.value} onClick={() => setOwnership(option.value)}>{option.label}</FilterPill>)}
                    </FilterRail>
                  </div>
                  {filterCount > 0 && <button type="button" onClick={() => { setCategory("all"); setOwnership("all"); setTag("all"); }} className="relative mb-2 justify-self-start text-[8px] font-bold uppercase text-primary-strong before:absolute before:-inset-x-2 before:-inset-y-4 before:content-['']">Clear filters</button>}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 flex items-center justify-between text-[10px] font-medium uppercase text-secondary">
            <p>{visibleReleases.length} releases · {shownItems} collectibles</p>
            {!filtersActive && <button type="button" onClick={() => {
              const allOpen = visibleReleases.every((release) => expanded.has(release.id));
              setExpanded(allOpen ? new Set() : new Set(visibleReleases.map((release) => release.id)));
            }} className="font-medium text-ink underline decoration-hairline-strong underline-offset-4">
              {visibleReleases.every((release) => expanded.has(release.id)) ? "Collapse all" : "Expand all"}
            </button>}
          </div>

          {yearGroups.length ? yearGroups.map(([year, yearReleases]) => (
            <section key={year} className="grid gap-6 py-8 first:pt-0 md:grid-cols-[74px_1fr] md:gap-10">
              <div><h2 className="sticky top-56 border-t border-ink pt-3 text-center text-sm font-bold tabular-nums">{year}</h2></div>
              <div>
                {yearReleases.map((release) => {
                  const filteredOpen = searchActive || ownership !== "all";
                  const open = filteredOpen || expanded.has(release.id);
                  return <ReleaseCard
                    key={release.id}
                    release={release}
                    visibleItems={release.visibleItems}
                    owned={owned}
                    pendingItemIds={pendingItemIds}
                    wishlist={wishlist}
                    pendingWishlistIds={pendingWishlistIds}
                    open={open}
                    filteredOpen={filteredOpen}
                    onToggleOpen={() => setExpanded((current) => {
                      const next = new Set(current);
                      if (next.has(release.id)) next.delete(release.id);
                      else next.add(release.id);
                      return next;
                    })}
                    onToggleItem={toggleItem}
                    onToggleWishlist={toggleWishlist}
                    onClear={() => clearRelease(release)}
                  />;
                })}
              </div>
            </section>
          )) : (
            <div className="grid min-h-80 place-items-center border border-hairline p-8 text-center">
              <div><h2 className="title-text">{ownership === "wishlist" ? "No wishlist items here." : ownership === "missing" && ownedCount === total ? "Nothing missing." : "Nothing hiding here."}</h2><p className="mt-2 text-xs text-secondary">{ownership === "wishlist" && !wishlist.size ? "Tap the hearts on items to build your wishlist." : ownership === "missing" && ownedCount === total ? "Your museum is complete." : "Try another search or loosen a filter."}</p><button type="button" onClick={clearFilters} className="chunky-button mt-6 h-11 border-primary bg-primary px-5 text-[10px] uppercase text-on-primary">Clear filters</button></div>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-black text-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-end gap-5 px-5 py-10 md:px-8">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={reset} className="chunky-button h-11 border-transparent bg-primary px-4 text-[10px] uppercase text-on-primary">Reset</button>
          </div>
        </div>
      </footer>

      <dialog ref={dialogRef} onCancel={() => setConfirmation(null)} className="m-auto w-[min(440px,calc(100%-40px))] border border-ink bg-canvas p-0 text-ink">
        {confirmation && <div className="p-6 md:p-8">
          <button type="button" onClick={() => setConfirmation(null)} aria-label="Close dialog" className="absolute right-4 top-4 grid size-11 place-items-center border border-hairline bg-canvas hover:border-ink"><Icon name="x" /></button>
          <h2 className="display-sm pr-8">{confirmation.title}</h2>
          <p className="mt-4 text-sm leading-5 text-secondary">{confirmation.body}</p>
          <div className="mt-8 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirmation(null)} className="chunky-button h-11 bg-canvas text-xs hover:bg-surface-hover">Keep it</button>
            <button type="button" onClick={() => { confirmation.action(); setConfirmation(null); }} className="chunky-button h-11 border-error bg-error text-xs text-white">{confirmation.actionLabel}</button>
          </div>
        </div>}
      </dialog>

      {changelogOpen && <ChangelogModal onDismiss={() => {
        setChangelogOpen(false);
        accountButtonRef.current?.focus({ preventScroll: true });
      }} />}

      <div role="status" aria-live="polite" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 bg-ink px-5 py-3 text-xs text-canvas transition-all duration-200 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>{toast}</div>

      <div
        ref={accountMenuRef}
        className="fixed bottom-5 right-5 z-40"
        onMouseEnter={() => { if (accountCanHover) setAccountOpen(true); }}
        onMouseLeave={() => {
          if (!accountCanHover) return;
          setAccountOpen(false);
          setHoveredAccountAction(null);
        }}
        onFocusCapture={() => { if (accountCanHover) setAccountOpen(true); }}
        onBlurCapture={(event) => {
          if (accountCanHover && !event.currentTarget.contains(event.relatedTarget)) {
            setAccountOpen(false);
            setHoveredAccountAction(null);
          }
        }}
      >
        <span
          role="tooltip"
          className={`pointer-events-none absolute bottom-[216px] right-full mr-3 translate-y-1/2 whitespace-nowrap bg-ink px-3 py-2 text-xs text-canvas transition-opacity duration-150 ${accountOpen && (!accountCanHover || hoveredAccountAction === "changelog") ? "opacity-100" : "opacity-0"}`}
        >
          Changelog
        </span>
        <span
          role="tooltip"
          className={`pointer-events-none absolute bottom-[168px] right-full mr-3 translate-y-1/2 whitespace-nowrap bg-ink px-3 py-2 text-xs text-canvas transition-opacity duration-150 ${accountOpen && (!accountCanHover || hoveredAccountAction === "logout") ? "opacity-100" : "opacity-0"}`}
        >
          Log out
        </span>
        <span
          role="tooltip"
          className={`pointer-events-none absolute bottom-[120px] right-full mr-3 translate-y-1/2 whitespace-nowrap bg-ink px-3 py-2 text-xs text-canvas transition-opacity duration-150 ${accountOpen && (!accountCanHover || hoveredAccountAction === "settings") ? "opacity-100" : "opacity-0"}`}
        >
          Settings
        </span>
        <span
          role="tooltip"
          className={`pointer-events-none absolute bottom-[72px] right-full mr-3 translate-y-1/2 whitespace-nowrap bg-ink px-3 py-2 text-xs text-canvas transition-opacity duration-150 ${accountOpen && (!accountCanHover || hoveredAccountAction === "friends") ? "opacity-100" : "opacity-0"}`}
        >
          Friends
        </span>
        <div className={`relative w-12 overflow-hidden rounded-full border border-ink bg-canvas text-ink transition-[height] duration-200 ease-out ${accountOpen ? "h-60" : "h-12"}`}>
          <button
            ref={accountButtonRef}
            type="button"
            onClick={() => { if (!accountCanHover) setAccountOpen((open) => !open); }}
            aria-expanded={accountOpen}
            aria-controls="account-actions"
            aria-label={accountOpen ? "Close account actions" : `Open account actions for ${username}`}
            className="absolute inset-x-0 bottom-0 grid h-12 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-focus"
          >
            <Avatar path={avatarPath} className={avatarPath ? "size-9" : "size-5"} iconClassName="size-5" />
          </button>
          <div id="account-actions" aria-hidden={!accountOpen} className={`absolute inset-x-0 bottom-12 flex h-48 flex-col ${accountOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            <button
              type="button"
              onClick={() => {
                setAccountOpen(false);
                setHoveredAccountAction(null);
                setChangelogOpen(true);
              }}
              onMouseEnter={() => setHoveredAccountAction("changelog")}
              onMouseLeave={() => setHoveredAccountAction(null)}
              onFocus={() => setHoveredAccountAction("changelog")}
              onBlur={() => setHoveredAccountAction(null)}
              tabIndex={accountOpen ? 0 : -1}
              aria-label="Changelog"
              aria-haspopup="dialog"
              className={`grid h-12 w-full shrink-0 place-items-center rounded-full transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-focus ${accountOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Icon name="info" className="size-5" />
            </button>
            <button
              type="button"
              onClick={lockArchive}
              onMouseEnter={() => setHoveredAccountAction("logout")}
              onMouseLeave={() => setHoveredAccountAction(null)}
              onFocus={() => setHoveredAccountAction("logout")}
              onBlur={() => setHoveredAccountAction(null)}
              tabIndex={accountOpen ? 0 : -1}
              aria-label="Log out"
              className={`grid h-12 w-full shrink-0 place-items-center rounded-full transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-focus ${accountOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Icon name="logout" className="size-5" />
            </button>
            <Link
              href="/settings"
              onMouseEnter={() => setHoveredAccountAction("settings")}
              onMouseLeave={() => setHoveredAccountAction(null)}
              onFocus={() => setHoveredAccountAction("settings")}
              onBlur={() => setHoveredAccountAction(null)}
              tabIndex={accountOpen ? 0 : -1}
              aria-label="Settings"
              className={`grid h-12 w-full shrink-0 place-items-center rounded-full transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-focus ${accountOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Icon name="settings" className="size-5" />
            </Link>
            <Link
              href="/friends"
              onMouseEnter={() => setHoveredAccountAction("friends")}
              onMouseLeave={() => setHoveredAccountAction(null)}
              onFocus={() => setHoveredAccountAction("friends")}
              onBlur={() => setHoveredAccountAction(null)}
              tabIndex={accountOpen ? 0 : -1}
              aria-label="Friends"
              className={`grid h-12 w-full shrink-0 place-items-center rounded-full transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-focus ${accountOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Icon name="friends" className="size-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
