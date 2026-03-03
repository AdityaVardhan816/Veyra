import { games } from "../src/lib/mock-data.ts";
import fs from "node:fs/promises";

const titles = [...new Set(games.map((game) => game.title))];
const imageByTitle = {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Veyra/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveSummaryImage(title) {
  const encodedTitle = encodeURIComponent(title.replaceAll(" ", "_"));
  const data = await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`, 6000);
  return data?.originalimage?.source ?? data?.thumbnail?.source ?? null;
}

async function resolveImage(title) {
  const titleVariants = [
    title,
    `${title} (video game)`,
    `${title} (2020 video game)`,
    `${title} (2021 video game)`,
    `${title} (2022 video game)`,
    `${title} (2023 video game)`,
    `${title} (2024 video game)`,
  ];

  for (const variant of titleVariants) {
    const summary = await resolveSummaryImage(variant);
    if (summary) {
      return summary;
    }
  }

  const query = encodeURIComponent(`${title} video game`);
  const search = await fetchJson(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&srlimit=6&format=json`,
    7000,
  );

  const candidates = (search?.query?.search ?? []).slice(0, 6);

  for (const candidate of candidates) {
    const summary = await resolveSummaryImage(candidate.title);
    if (summary) {
      return summary;
    }
  }

  return null;
}

for (const title of titles) {
  const imageUrl = await resolveImage(title);
  if (imageUrl) {
    imageByTitle[title] = imageUrl;
  }

  await sleep(120);
}

const output = `export const gameImageByTitle: Record<string, string> = ${JSON.stringify(imageByTitle, null, 2)};\n`;
await fs.writeFile(new URL("../src/lib/game-image-map.ts", import.meta.url), output, "utf8");

console.log(`resolved ${Object.keys(imageByTitle).length} / ${titles.length}`);
