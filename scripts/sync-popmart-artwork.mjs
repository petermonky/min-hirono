import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { catalog } from "../data/hirono-catalog.js";

const officialPages = {
  "hirono-the-other-one": "https://www.popmart.com/us/products/739/hirono-the-other-one-series",
  "hirono-little-mischief": "https://www.popmart.com/us/products/13/hirono-little-mischief-series",
  "hirono-city-of-mercy": "https://www.popmart.com/gb/products/-hirono-city-of-mercy-series/fd9a7a86-4bbe-432e-9a83-89d375e9670d",
  "hirono-mime": "https://www.popmart.com/us/products/365/hirono-mime-series-figures",
  "hirono-reshape": "https://www.popmart.com/us/products/867/hirono-reshape-series-figures",
  "hirono-shelter": "https://www.popmart.com/us/products/1385/hirono-shelter-series-figures",
  "hirono-le-petit-prince": "https://www.popmart.com/us/products/1604/hirono-%C3%97-le-petit-prince-series-figures",
  "hirono-clot": "https://www.popmart.com/us/products/1747/hirono-%C3%97-clot-series-figures",
  "hirono-echo": "https://www.popmart.com/us/products/2165/hirono-echo-series-figures",
  "hirono-echo-pendant-chain": "https://www.popmart.com/us/products/2169/hirono-echo-series-pendant-chain-blind-box",
  "hirono-echo-cable": "https://www.popmart.com/us/products/2079/hirono-echo-series-2-in-1-cable-blind-box",
  "hirono-echo-mini-bag": "https://www.popmart.com/us/products/2161/hirono-echo-series-mini-bag-blind-box",
  "hirono-echo-magnet-clip": "https://www.popmart.com/us/products/2164/hirono-echo-series-fridge-magnet-clip-blind-box",
  "hirono-monsters-carnival": "https://www.popmart.com/us/products/3944/hirono-monsters%27-carnival-series-figures",
  "hirono-road-journal-plush": "https://www.popmart.com/us/products/5166/hirono-road-journal-series-plush-doll-pendant-blind-box",
  "hirono-road-journal-phone-lanyard": "https://www.popmart.com/us/products/4925",
  "hirono-road-journal-mini-bag": "https://www.popmart.com/us/products/5167",
  "hirono-road-journal-magnets": "https://www.popmart.com/us/products/4924",
  "hirono-snoopy-figure": "https://www.popmart.com/us/products/2160/hirono-%C3%97-snoopy-figure",
  "hirono-tamed-wildgrass": "https://www.popmart.com/us/products/6071/hirono-tamed-wildgrass-series-figures",
  "hirono-little-hare-plush": "https://www.popmart.com/us/products/6070/hirono-little-hare-plush-doll-pendant",
  "hirono-mist-walker": "https://www.popmart.com/us/products/8247/hirono-mist-walker-series---plush-doll-pendant",
  "hirono-dino-plush": "https://www.popmart.com/us/products/8685/hirono-dino-plush-doll-pendant",
  "hirono-kodak-click-bear-plush": "https://www.popmart.com/us/products/8426/hirono-%C3%97-kodak-click-bear-plush-doll-pendant",
  "hirono-after-dark-plush": "https://www.popmart.com/us/products/8754/hirono-after-dark-series-plush-doll-pendant",
  "hirono-after-dark-magnets": "https://www.popmart.com/us/products/8751/hirono-after-dark-series-fridge-magnet-blind-box",
  "hirono-after-dark-night-light": "https://www.popmart.com/us/products/8756/hirono-after-dark-series-night-light-charm-blind-box",
  "hirono-the-hundreds-figure": "https://www.popmart.com/us/products/8750/hirono-%C3%97-the-hundreds-figure",
  "hirono-the-hundreds-pendant": "https://www.popmart.com/us/products/8749/hirono-%C3%97-the-hundreds-pendant",
  "hirono-harry-potter": "https://www.popmart.com/us/products/9119/hirono-%C3%97-harry-potter-series-figures",
  "hirono-snowman": "https://www.popmart.com/us/products/9302/hirono-snowman-figurine"
};

// POP MART's US page currently exposes unrelated Ahsoka thumbnails for this
// release. Keep these verified cutouts from the product lineup artwork instead.
const curatedArtwork = {
  "hirono-echo-magnet-clip-back-off": "/artwork/hirono-echo-magnet-clip/back-off.png",
  "hirono-echo-magnet-clip-staying-up": "/artwork/hirono-echo-magnet-clip/staying-up.png",
  "hirono-echo-magnet-clip-get-lucky": "/artwork/hirono-echo-magnet-clip/get-lucky.png",
  "hirono-echo-magnet-clip-knight": "/artwork/hirono-echo-magnet-clip/knight.png",
  "hirono-echo-magnet-clip-pieces-of-memory": "/artwork/hirono-echo-magnet-clip/pieces-of-memory.png",
  "hirono-echo-magnet-clip-caught-you": "/artwork/hirono-echo-magnet-clip/caught-you.png",
  "hirono-echo-magnet-clip-never-growing-up": "/artwork/hirono-echo-magnet-clip/never-growing-up.png"
};

// The current GB page renders its gallery client-side. These clean, square item
// images come from POP MART's official City of Mercy gallery record. Explicit
// non-POPMART exceptions live in external-artwork.json and are not managed here.
const curatedRemoteArtwork = {
  "hirono-city-of-mercy-the-other": "https://prod-america-res.popmart.com/default/2_oSW0OpIT0a_1200x1200.jpg",
  "hirono-city-of-mercy-insight": "https://prod-america-res.popmart.com/default/1_hgI4HXkObl_1200x1200.jpg",
  "hirono-city-of-mercy-comfortably-numb": "https://prod-america-res.popmart.com/default/4_N6AeH3DWjg_1200x1200.jpg",
  "hirono-city-of-mercy-healer": "https://prod-america-res.popmart.com/default/3_0ih3aOL9iG_1200x1200.jpg",
  "hirono-city-of-mercy-fallen-angel": "https://prod-america-res.popmart.com/default/5_5U3lmtrRCp_1200x1200.jpg",
  "hirono-city-of-mercy-echo": "https://prod-america-res.popmart.com/default/7_ygoEvalgiP_1200x1200.jpg",
  "hirono-city-of-mercy-belonging": "https://prod-america-res.popmart.com/default/6_MBMgg8S54Y_1200x1200.jpg",
};

const curatedRemoteCovers = {
  "hirono-city-of-mercy": "https://prod-america-res.popmart.com/default/%E7%BB%84%E5%90%88-1_EX5rcbNUnA_1200x1200.jpg"
};

const readJson = async (path, fallback) => {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
};

const fileExists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const normalize = (value) => value
  .toLowerCase()
  .normalize("NFKD")
  .replace(/silent$/, "silence")
  .replace(/secret|special|edition|ver\.?/g, "")
  .replace(/[^a-z0-9]+/g, "");

const findArrays = (node, key, results = []) => {
  if (!node || typeof node !== "object") return results;
  for (const [name, value] of Object.entries(node)) {
    if (name === key && Array.isArray(value)) results.push(value);
    else findArrays(value, key, results);
  }
  return results;
};

const escapeXml = (value) => value.replace(/[<>&'"]/g, (char) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;"
}[char]));

const makeFallbackSvg = (release, item) => {
  const title = escapeXml(item.name);
  const releaseName = escapeXml(release.name);
  const [warm, dark] = release.palette || ["#D8D4D1", "#817C79"];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 960" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title><desc id="desc">Illustrated catalog placeholder for ${title} from ${releaseName}</desc>
  <rect width="800" height="960" fill="#F2F2F2"/>
  <circle cx="620" cy="170" r="210" fill="${warm}" opacity=".35"/>
  <ellipse cx="400" cy="790" rx="220" ry="34" fill="#0D0D0D" opacity=".06"/>
  <path d="M276 390c0-94 56-164 124-164s124 70 124 164v72c72 45 108 114 108 205 0 91-89 139-232 139s-232-48-232-139c0-91 36-160 108-205z" fill="${warm}"/>
  <path d="M313 314c22-71 151-83 177 0-34-19-66-28-94-28-27 0-55 9-83 28z" fill="${dark}" opacity=".76"/>
  <circle cx="354" cy="407" r="10" fill="#0D0D0D"/><circle cx="446" cy="407" r="10" fill="#0D0D0D"/>
  <path d="M376 448c16 10 32 10 48 0" fill="none" stroke="#0D0D0D" stroke-width="7" stroke-linecap="round" opacity=".5"/>
  <text x="40" y="72" font-family="Inter,Arial,sans-serif" font-size="22" fill="#6F6F6F">HIRONO · ARCHIVE IMAGE</text>
  <text x="40" y="900" font-family="Inter,Arial,sans-serif" font-size="28" font-weight="500" fill="#0D0D0D">${title}</text>
  <text x="40" y="932" font-family="Inter,Arial,sans-serif" font-size="16" fill="#6F6F6F">Artwork pending verified product photography</text>
  </svg>`;
};

// Kept only so older checked-in artwork can still be identified during cleanup;
// the sync process no longer generates or registers illustrated fallbacks.
void makeFallbackSvg;

const extractPage = async ([releaseId, url]) => {
  try {
    const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 HironoCatalog/1.0" } });
    if (!response.ok) throw new Error(`${response.status}`);
    const html = await response.text();
    const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    const data = nextData ? JSON.parse(nextData[1]) : {};
    const toys = findArrays(data, "toys").sort((a, b) => b.length - a.length)[0] || [];
    const cover = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || null;
    return { releaseId, url, toys, cover };
  } catch (error) {
    console.warn(`Could not sync ${releaseId}: ${error.message}`);
    return { releaseId, url, toys: [], cover: null };
  }
};

const previousArtwork = await readJson("src/data/official-artwork.json", { items: {}, covers: {} });
const previousSources = await readJson("src/data/official-artwork-sources.json", { items: {}, covers: {} });
const remoteArtwork = {
  items: {
    ...Object.fromEntries(Object.entries(previousArtwork.items || {}).filter(([, url]) => url.startsWith("http"))),
    ...(previousSources.items || {})
  },
  covers: {
    ...Object.fromEntries(Object.entries(previousArtwork.covers || {}).filter(([, url]) => url.startsWith("http"))),
    ...(previousSources.covers || {})
  }
};

const results = await Promise.all(Object.entries(officialPages).map(extractPage));
for (const release of catalog) {
  const result = results.find((entry) => entry.releaseId === release.id);
  if (result?.cover) remoteArtwork.covers[release.id] = result.cover;

  for (const item of release.items) {
    const existing = item.image?.src;
    const toy = release.id === "hirono-echo-magnet-clip"
      ? null
      : result?.toys.find((entry) => normalize(entry.name) === normalize(item.name));
    const standaloneCover = release.items.length === 1 ? result?.cover : null;
    const source = toy?.url || (existing?.startsWith("http") ? existing : null) || standaloneCover;
    if (source) remoteArtwork.items[item.id] = source;
  }
}
Object.assign(remoteArtwork.items, curatedRemoteArtwork);
Object.assign(remoteArtwork.covers, curatedRemoteCovers);

const extensionFor = (url, contentType = "") => {
  const pathExtension = new URL(url).pathname.match(/\.(png|jpe?g|webp|avif)$/i)?.[1]?.toLowerCase();
  if (pathExtension) return pathExtension === "jpeg" ? "jpg" : pathExtension;
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("avif")) return "avif";
  return "jpg";
};

const downloadAsset = async ({ url, releaseId, name }) => {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 HironoCatalog/1.0" } });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  const extension = extensionFor(url, response.headers.get("content-type") || "");
  const directory = `public/artwork/${releaseId}`;
  const diskPath = `${directory}/${name}.${extension}`;
  await mkdir(directory, { recursive: true });
  const source = Buffer.from(await response.arrayBuffer());
  const output = releaseId === "hirono-city-of-mercy"
    ? await sharp(source)
      .resize(1200, 1200, { fit: "contain", background: "#f7f7f7" })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer()
    : source;
  await writeFile(diskPath, output);
  await Promise.all(["jpg", "png", "webp", "avif"]
    .filter((candidate) => candidate !== extension)
    .map(async (candidate) => {
      try {
        await unlink(`${directory}/${name}.${candidate}`);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }));
  return `/${diskPath.replace(/^public\//, "")}`;
};

const tasks = [];
for (const release of catalog) {
  for (const item of release.items) {
    if (curatedArtwork[item.id]) continue;
    const url = remoteArtwork.items[item.id];
    if (url) tasks.push({ kind: "item", key: item.id, releaseId: release.id, name: item.id, url });
  }
  const coverUrl = remoteArtwork.covers[release.id];
  if (coverUrl) tasks.push({ kind: "cover", key: release.id, releaseId: release.id, name: "cover", url: coverUrl });
}

const artwork = { items: { ...curatedArtwork }, covers: {}, sources: officialPages };
let cursor = 0;
const workers = Array.from({ length: 8 }, async () => {
  while (cursor < tasks.length) {
    const task = tasks[cursor++];
    try {
      const localPath = await downloadAsset(task);
      artwork[task.kind === "item" ? "items" : "covers"][task.key] = localPath;
    } catch (error) {
      const previousPath = previousArtwork[task.kind === "item" ? "items" : "covers"]?.[task.key];
      if (previousPath?.startsWith("/") && await fileExists(`public${previousPath}`)) {
        artwork[task.kind === "item" ? "items" : "covers"][task.key] = previousPath;
      }
      console.warn(`Could not download ${task.key}: ${error.message}`);
    }
  }
});
await Promise.all(workers);

await mkdir("src/data", { recursive: true });
await writeFile("src/data/official-artwork-sources.json", `${JSON.stringify(remoteArtwork, null, 2)}\n`);
await writeFile("src/data/official-artwork.json", `${JSON.stringify(artwork, null, 2)}\n`);

const totalItems = catalog.flatMap((release) => release.items).length;
const localCount = Object.keys(artwork.items).length;
console.log(`Artwork ready: ${localCount} downloaded or curated locally, ${totalItems - localCount} text placeholders.`);
