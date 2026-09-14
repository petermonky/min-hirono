import artwork from "@/data/official-artwork.json";
import { catalog as baseCatalog } from "../../data/hirono-catalog.js";

export type Category = "figures" | "plush" | "accessories" | "collaborations";
export type Rarity = "standard" | "secret" | "special";

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
  releaseDate: string;
  year: number;
  type: string;
  category: Category;
  collectionType: "blind-box" | "standalone";
  collaboration?: string | null;
  description?: string;
  palette?: [string, string];
  sourceUrl?: string;
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
  .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

export const allReleasedItemIds = new Set(
  releases.filter((release) => release.status !== "upcoming").flatMap((release) => release.items.map((item) => item.id)),
);
