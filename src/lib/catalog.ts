import artwork from "@/data/official-artwork.json";
import { catalog as baseCatalog } from "../../data/hirono-catalog.js";

export type Category = "figures" | "plush" | "accessories" | "collaborations";
export type Rarity = "standard" | "secret" | "special";
export type CatalogTag = "mixed-ip";
export type SourceKind = "official" | "official-archive";

export interface CollectibleItem {
  id: string;
  name: string;
  rarity: Rarity;
  odds: string | null;
  image: {
    src: string | null;
    alt: string;
    official: boolean;
  };
}

export interface Release {
  id: string;
  name: string;
  releaseDate: string | null;
  year: number | null;
  type: string;
  category: Category;
  collectionType: "blind-box" | "standalone";
  collaboration?: string | null;
  description?: string;
  palette?: [string, string];
  sourceUrl?: string;
  sourceKind: SourceKind;
  tags: CatalogTag[];
  coverImage: string | null;
  status?: "upcoming";
  items: CollectibleItem[];
}

type BaseRelease = Omit<Release, "coverImage" | "items"> & {
  coverImage?: string;
  items: Array<Omit<CollectibleItem, "image"> & { image?: { src: string; alt: string } | null }>;
};

const itemArtwork = artwork.items as Record<string, string>;
const coverArtwork = artwork.covers as Record<string, string>;
const sourceArtwork = artwork.sources as Record<string, string>;

export const releases: Release[] = (baseCatalog as BaseRelease[])
  .map((release) => {
    const items = release.items.map((item) => {
      const src = itemArtwork[item.id] || item.image?.src || null;
      return {
        ...item,
        image: {
          src,
          alt: item.image?.alt || `${item.name} from ${release.name}`,
          official: Boolean(src?.startsWith("https://") && src.includes("popmart.com")),
        },
      };
    });

    return {
      ...release,
      sourceUrl: sourceArtwork[release.id] || release.sourceUrl,
      coverImage: coverArtwork[release.id] || release.coverImage || items[0].image.src,
      items,
    };
  })
  .sort((a, b) => {
    if (a.releaseDate && b.releaseDate) return a.releaseDate.localeCompare(b.releaseDate);
    if (a.releaseDate) return -1;
    if (b.releaseDate) return 1;
    if (a.year && b.year && a.year !== b.year) return a.year - b.year;
    if (a.year) return -1;
    if (b.year) return 1;
    return a.name.localeCompare(b.name);
  });

export const allReleasedItemIds = new Set(
  releases.filter((release) => release.status !== "upcoming").flatMap((release) => release.items.map((item) => item.id)),
);
