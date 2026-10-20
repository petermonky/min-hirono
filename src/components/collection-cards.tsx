"use client";

import Image from "next/image";
import { memo, useState } from "react";
import { Icon } from "@/components/icon";
import type { CollectibleItem, Release } from "@/lib/catalog";

const releaseDateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

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

type ItemCardProps = {
  item: CollectibleItem;
  owned: boolean;
  wishlisted: boolean;
} & ({ mode: "readonly" } | {
  mode?: "editable";
  disabled: boolean;
  pending: boolean;
  wishlistPending: boolean;
  onToggle: (id: string) => void;
  onToggleWishlist: (id: string) => void;
});

const ItemCard = memo(function ItemCard(props: ItemCardProps) {
  const { item, owned, wishlisted } = props;
  const [justToggled, setJustToggled] = useState(false);
  const content = <>
      <span className={`collectible-frame relative block aspect-square overflow-hidden bg-canvas-soft transition-all duration-200 ease-museum ${
        owned ? "border-ink" : "group-hover:border-hairline-strong"
      }`}>
        {item.rarity !== "standard" && (
          <span className="absolute left-0 top-0 z-10 bg-ink px-2 py-1.5 text-[9px] font-bold uppercase text-white">
            {item.rarity === "secret" ? "✦ Secret" : "Special"}
          </span>
        )}
        {item.odds && <span className="absolute bottom-0 left-0 z-10 bg-canvas px-2 py-1.5 text-[9px] font-semibold text-secondary">{item.odds}</span>}
        <span className={`store-grid-image absolute inset-0 transition-[opacity,filter] duration-200 ${props.mode === "readonly" || owned ? "opacity-100" : "opacity-50 grayscale-[40%] group-hover:opacity-70"}`}>
          <MuseumImage item={item} sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 190px" />
        </span>
      </span>
      <span className="mt-3 block truncate text-xs font-semibold text-ink">{item.name}</span>
  </>;

  if (props.mode === "readonly") {
    return <div className="store-grid-card relative min-w-0" data-item-id={item.id}>
      {content}
      {wishlisted && <span className="pointer-events-none absolute right-0 top-0 z-20 grid size-11 place-items-center" role="img" aria-label="On wishlist">
        <Icon name="heart" className="size-6 fill-primary stroke-primary stroke-[1.2]" />
      </span>}
    </div>;
  }

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => {
          props.onToggle(item.id);
          setJustToggled(true);
          window.setTimeout(() => setJustToggled(false), 300);
        }}
        disabled={props.disabled || props.pending}
        aria-pressed={owned}
        aria-label={`${item.name} — ${props.disabled ? "coming soon" : props.pending ? "saving" : owned ? "owned, mark as missing" : "missing, mark as owned"}`}
        className={`store-grid-card group w-full min-w-0 text-left ${justToggled ? "item-enter" : ""}`}
      >
        {content}
      </button>
      <button
        type="button"
        onClick={() => props.onToggleWishlist(item.id)}
        disabled={props.wishlistPending}
        aria-pressed={wishlisted}
        aria-label={`${wishlisted ? "Remove" : "Add"} ${item.name} ${wishlisted ? "from" : "to"} wishlist`}
        aria-busy={props.wishlistPending}
        className={`absolute right-0 top-0 z-20 grid size-11 place-items-center ${wishlisted ? "text-primary" : "text-mute"}`}
      >
        <Icon name="heart" className={`size-6 stroke-[1.2] transition-[fill,stroke,color] duration-150 ${wishlisted ? "fill-primary stroke-primary" : "fill-mute/55 stroke-hairline-strong/60"}`} />
      </button>
    </div>
  );
});

type ReleaseCardProps = {
  release: Release;
  visibleItems: CollectibleItem[];
  owned: Set<string>;
  wishlist: Set<string>;
  open: boolean;
  onToggleOpen: () => void;
} & ({ mode: "readonly"; view: "owned" | "wishlist" } | {
  mode?: "editable";
  pendingItemIds: Set<string>;
  pendingWishlistIds: Set<string>;
  filteredOpen: boolean;
  onToggleItem: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onClear: () => void;
});

export function ReleaseCard(props: ReleaseCardProps) {
  const { release, visibleItems, owned, wishlist, open, onToggleOpen } = props;
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
          {props.mode === "readonly" ? (
            <span className="block text-xs text-secondary">{visibleItems.length} {props.view === "owned" ? "collected" : "on wishlist"}</span>
          ) : <>
          <span className="mb-3 flex items-end justify-between text-xs">
            <span className="text-secondary">{upcoming ? "Not counted yet" : `${ownedCount} / ${release.items.length} collected`}</span>
            <strong className="font-semibold text-ink">{upcoming ? "—" : complete ? "Complete" : `${percent}%`}</strong>
          </span>
          <span className="progress-track block" aria-hidden="true">
            <span className="progress-fill block transition-[width] duration-300 ease-museum" style={{ width: `${upcoming ? 0 : percent}%` }} />
          </span>
          </>}
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
                {props.mode !== "readonly" && ownedCount > 0 && !upcoming && <button type="button" onClick={props.onClear} className="text-secondary hover:text-error">Clear release</button>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {visibleItems.map((item) => (
                props.mode === "readonly"
                  ? <ItemCard key={item.id} mode="readonly" item={item} owned={owned.has(item.id)} wishlisted={wishlist.has(item.id)} />
                  : <ItemCard key={item.id} item={item} owned={owned.has(item.id)} disabled={upcoming} pending={props.pendingItemIds.has(item.id)} wishlisted={wishlist.has(item.id)} wishlistPending={props.pendingWishlistIds.has(item.id)} onToggle={props.onToggleItem} onToggleWishlist={props.onToggleWishlist} />
              ))}
            </div>
            {props.mode !== "readonly" && props.filteredOpen && <p className="mt-8 border-t border-hairline pt-4 text-xs text-mute">This release is expanded while filters are active.</p>}
          </div>
        </div>
      </div>
    </article>
  );
}
