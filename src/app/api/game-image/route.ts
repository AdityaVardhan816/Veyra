import { NextResponse } from "next/server";
import { gameImageByTitle } from "@/lib/game-image-map";

type SteamSearchResponse = {
  items?: Array<{
    id: number;
    name: string;
  }>;
};

const imageCache = new Map<string, string>();
const normalizedGameImageByTitle = new Map(Object.entries(gameImageByTitle).map(([title, imageUrl]) => [normalize(title), imageUrl]));
const pinnedImageUrlByTitle: Record<string, string> = {
  "death stranding 2": "https://upload.wikimedia.org/wikipedia/en/e/e0/Death_Stranding_2_Icon.jpg",
  "assassin s creed shadows": "https://upload.wikimedia.org/wikipedia/en/5/54/Assassin%27s_Creed_Shadows_cover.png",
  "grand theft auto v": "https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png",
  "red dead redemption": "https://upload.wikimedia.org/wikipedia/en/a/a7/Red_Dead_Redemption.jpg",
  fortnite: "https://upload.wikimedia.org/wikipedia/en/3/3a/Fortnite_cover.jpg",
  "gran turismo 7": "https://upload.wikimedia.org/wikipedia/en/1/14/Gran_Turismo_7_cover_art.jpg",
  "grand turismo 7": "https://upload.wikimedia.org/wikipedia/en/1/14/Gran_Turismo_7_cover_art.jpg",
  "super smash bros ultimate": "https://upload.wikimedia.org/wikipedia/en/5/50/Super_Smash_Bros._Ultimate.jpg",
  "the legend of zelda tears of the kingdom": "https://upload.wikimedia.org/wikipedia/en/f/fb/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg",
  "the legend of zelda breath of the wild": "https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg",
};
const pinnedSteamAppIdByTitle: Record<string, number> = {
  "baldurs gate 3": 1086940,
  "elden ring": 1245620,
  "cyberpunk 2077": 1091500,
  "death stranding 2": 3280350,
  "assassin s creed shadows": 3159330,
  "portal 2": 620,
  "path of exile 2": 2694490,
  hades: 1145360,
  "hades ii": 1145350,
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = (url.searchParams.get("title") ?? "Veyra").slice(0, 60);
  const type = url.searchParams.get("type") === "banner" ? "banner" : "cover";
  const cacheKey = `${type}:${title.toLowerCase()}`;
  const normalizedTitle = normalize(title);
  const pinnedImageUrl = pinnedImageUrlByTitle[normalizedTitle];

  if (pinnedImageUrl) {
    imageCache.set(cacheKey, pinnedImageUrl);
    return buildRedirectResponse(pinnedImageUrl);
  }

  const cached = imageCache.get(cacheKey);
  if (cached) {
    return buildRedirectResponse(cached);
  }

  const resolvedImage = await resolveSteamImage(title, type);

  if (resolvedImage) {
    imageCache.set(cacheKey, resolvedImage);
    return buildRedirectResponse(resolvedImage);
  }

  const width = type === "banner" ? 1280 : 600;
  const height = type === "banner" ? 720 : 900;

  const safeTitle = escapeSvg(title);
  const primaryLine = safeTitle.length > 28 ? `${safeTitle.slice(0, 28)}…` : safeTitle;
  const secondaryLine = type === "banner" ? "Veyra Banner" : "Veyra Cover";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#12182A" />
      <stop offset="100%" stop-color="#0A0D17" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <circle cx="${Math.floor(width * 0.85)}" cy="${Math.floor(height * 0.2)}" r="${Math.floor(Math.min(width, height) * 0.18)}" fill="#7C5CFF" opacity="0.25" />
  <circle cx="${Math.floor(width * 0.15)}" cy="${Math.floor(height * 0.8)}" r="${Math.floor(Math.min(width, height) * 0.14)}" fill="#3B82F6" opacity="0.2" />
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${type === "banner" ? 42 : 36}" font-weight="700" fill="#F8FAFC">${primaryLine}</text>
  <text x="50%" y="${type === "banner" ? 62 : 58}%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${type === "banner" ? 20 : 18}" fill="#CBD5E1">${secondaryLine}</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}

function buildRedirectResponse(url: string) {
  const response = NextResponse.redirect(url, 307);
  response.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
  return response;
}

function escapeSvg(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function resolveSteamImage(title: string, type: "cover" | "banner"): Promise<string | null> {
  try {
    const normalizedTitle = normalize(title);
    const pinnedImageUrl = pinnedImageUrlByTitle[normalizedTitle];
    const mappedImageUrl = gameImageByTitle[title] ?? normalizedGameImageByTitle.get(normalizedTitle);

    if (pinnedImageUrl) {
      return pinnedImageUrl;
    }

    let steamCandidateUrl: string | null = null;

    const pinnedAppId = pinnedSteamAppIdByTitle[normalizedTitle];
    if (pinnedAppId) {
      steamCandidateUrl = buildSteamImageUrl(pinnedAppId, type);
    }

    if (!steamCandidateUrl) {
      const query = encodeURIComponent(title);
      const response = await fetchWithRetry(`https://store.steampowered.com/api/storesearch/?term=${query}&l=english&cc=us`, 3, 2500);

      if (!response.ok) {
        return pinnedImageUrl ?? mappedImageUrl ?? null;
      }

      const data = (await response.json()) as SteamSearchResponse;
      let candidates = data.items ?? [];

      if (candidates.length === 0) {
        const looseTerm = encodeURIComponent(normalizedTitle.split(" ").slice(0, 2).join(" "));
        const looseResponse = await fetchWithRetry(
          `https://store.steampowered.com/api/storesearch/?term=${looseTerm}&l=english&cc=us`,
          2,
          2500,
        );

        if (looseResponse.ok) {
          const looseData = (await looseResponse.json()) as SteamSearchResponse;
          candidates = looseData.items ?? [];
        }
      }

      if (candidates.length > 0) {
        const best =
          candidates.find((item) => normalize(item.name) === normalizedTitle) ??
          candidates.find((item) => normalize(item.name).includes(normalizedTitle) || normalizedTitle.includes(normalize(item.name)));

        if (best) {
          steamCandidateUrl = buildSteamImageUrl(best.id, type);
        }
      }
    }

    if (steamCandidateUrl && (await isReachableImageUrl(steamCandidateUrl))) {
      return steamCandidateUrl;
    }

    if (pinnedImageUrl) {
      return pinnedImageUrl;
    }

    if (mappedImageUrl) {
      return mappedImageUrl;
    }

    return null;
  } catch {
    const normalizedTitle = normalize(title);
    const pinnedImageUrl = pinnedImageUrlByTitle[normalizedTitle];
    const mapped = gameImageByTitle[title] ?? normalizedGameImageByTitle.get(normalizedTitle);
    return pinnedImageUrl ?? mapped ?? null;
  }
}

function buildSteamImageUrl(appId: number, type: "cover" | "banner") {
  if (type === "cover") {
    return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`;
  }

  return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/capsule_616x353.jpg`;
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: {
        "User-Agent": "Veyra/1.0",
      },
      next: { revalidate: 86400 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetry(url: string, attempts: number, timeoutMs: number) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchWithTimeout(url, timeoutMs);
    } catch {
      if (attempt === attempts) {
        throw new Error(`Failed to fetch after ${attempts} attempts`);
      }
    }
  }

  throw new Error("Unreachable retry state");
}

async function isReachableImageUrl(url: string) {
  try {
    const response = await fetchWithTimeout(url, 2200);
    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get("content-type") ?? "";
    return contentType.toLowerCase().startsWith("image/");
  } catch {
    return false;
  }
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replaceAll("’", "'")
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim();
}

