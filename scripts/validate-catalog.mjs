import { existsSync, readFileSync } from "node:fs";
import { catalog } from "../data/hirono-catalog.js";

const externalArtwork = JSON.parse(readFileSync(new URL("../src/data/external-artwork.json", import.meta.url), "utf8"));

const fail = (message) => {
  throw new Error(`Catalog validation failed: ${message}`);
};

const assert = (condition, message) => {
  if (!condition) fail(message);
};

const isPopMartUrl = (value) => {
  if (!value?.startsWith("https://")) return false;
  return new URL(value).hostname.endsWith("popmart.com");
};

const releaseIds = new Set();
const itemIds = new Set();
const categories = new Set(["figures", "plush", "accessories", "collaborations"]);
const sourceKinds = new Set(["official", "official-archive"]);
const tags = new Set(["mixed-ip"]);

for (const release of catalog) {
  assert(!releaseIds.has(release.id), `duplicate release id ${release.id}`);
  releaseIds.add(release.id);
  assert(categories.has(release.category), `invalid category on ${release.id}`);
  assert(sourceKinds.has(release.sourceKind), `non-official source kind on ${release.id}`);
  assert(isPopMartUrl(release.sourceUrl), `${release.id} source is not on popmart.com`);
  assert(Array.isArray(release.tags) && release.tags.every((tag) => tags.has(tag)), `invalid tags on ${release.id}`);
  assert(Array.isArray(release.items) && release.items.length > 0, `${release.id} has no collectibles`);

  if (release.releaseDate) {
    assert(/^20\d{2}-\d{2}-\d{2}$/.test(release.releaseDate), `invalid release date on ${release.id}`);
    assert(release.year === Number(release.releaseDate.slice(0, 4)), `date/year mismatch on ${release.id}`);
  }

  if (release.coverImage?.startsWith("https://")) {
    assert(isPopMartUrl(release.coverImage), `${release.id} cover is not hosted by POP MART`);
  }

  for (const item of release.items) {
    assert(!itemIds.has(item.id), `duplicate collectible id ${item.id}`);
    itemIds.add(item.id);
    assert(item.name.trim(), `blank collectible name on ${release.id}`);
    assert(!/sealed|confirmed figures|full\s*set|fullset|one blind box|opened box/i.test(item.name), `purchase option leaked into ${item.id}`);
    if (item.image?.src?.startsWith("https://")) {
      assert(isPopMartUrl(item.image.src), `${item.id} image is not hosted by POP MART`);
    }
  }
}

const stableReleaseIds = [
  "hirono-the-other-one", "hirono-little-mischief", "hirono-city-of-mercy", "hirono-mime",
  "hirono-reshape", "hirono-shelter", "hirono-le-petit-prince", "hirono-clot", "hirono-echo",
  "hirono-echo-pendant-chain", "hirono-echo-cable", "hirono-echo-mini-bag", "hirono-echo-magnet-clip",
  "hirono-snoopy-figure", "hirono-monsters-carnival", "hirono-road-journal-plush",
  "hirono-road-journal-phone-lanyard", "hirono-road-journal-mini-bag", "hirono-road-journal-magnets",
  "hirono-tamed-wildgrass", "hirono-little-hare-plush", "hirono-mist-walker",
  "hirono-kodak-click-bear-plush", "hirono-dino-plush", "hirono-after-dark-plush",
  "hirono-after-dark-magnets", "hirono-after-dark-night-light", "hirono-the-hundreds-figure",
  "hirono-the-hundreds-pendant", "hirono-harry-potter",
];

for (const id of stableReleaseIds) assert(releaseIds.has(id), `stable release id ${id} was removed`);

const validateExternalArtwork = (kind, entries, validIds) => {
  for (const [id, entry] of Object.entries(entries)) {
    assert(validIds.has(id), `external ${kind} artwork points to unknown id ${id}`);
    assert(typeof entry.src === "string" && entry.src.startsWith("/artwork/"), `external ${kind} artwork ${id} must use a checked-in local asset`);
    assert(existsSync(`public${entry.src}`), `external ${kind} artwork file is missing for ${id}`);
    assert(typeof entry.sourceUrl === "string" && entry.sourceUrl.startsWith("https://"), `external ${kind} artwork ${id} needs an HTTPS source URL`);
    assert(typeof entry.provider === "string" && entry.provider.trim(), `external ${kind} artwork ${id} needs a provider`);
    assert(typeof entry.attribution === "string" && entry.attribution.trim(), `external ${kind} artwork ${id} needs attribution`);
  }
};

validateExternalArtwork("item", externalArtwork.items, itemIds);
validateExternalArtwork("cover", externalArtwork.covers, releaseIds);

assert(catalog.length === 62, "unexpected total release count");
assert(itemIds.size === 268, "unexpected collectible count");
assert(catalog.find((release) => release.id === "hirono-harry-potter")?.status !== "upcoming", "Harry Potter must count toward collection completion");
const snowman = catalog.find((release) => release.id === "hirono-snowman");
assert(snowman?.releaseDate === "2026-10-22" && snowman.status === "upcoming", "Snowman must retain its official upcoming release date");
assert(snowman?.items.length === 1 && snowman.items[0].image?.src, "Snowman must include its official product image");
assert(catalog.filter((release) => release.tags.includes("mixed-ip")).length === 15, "unexpected mixed-IP release count");
assert(catalog.find((release) => release.id === "hirono-little-hare-plush")?.items.length === 2, "Little Hare must include regular and special versions");
assert(releaseIds.has("hirono-shanghai-pts-limited-figures"), "HIRONO Doll Panda is missing");

const externalArtworkCount = Object.keys(externalArtwork.items).length + Object.keys(externalArtwork.covers).length;
console.log(`Catalog valid: ${catalog.length} releases, ${itemIds.size} collectibles, POP MART product sources, ${externalArtworkCount} attributed external artwork exception(s).`);
