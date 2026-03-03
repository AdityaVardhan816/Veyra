import fs from "node:fs";
import path from "node:path";

export type DevWatchlistEntry = {
  id: string;
  userId: string;
  gameSlug: string;
  createdAt: string;
};

const devWatchlistStorePath = path.join(process.cwd(), ".dev-watchlist.json");

function loadWatchlistFromDisk() {
  try {
    if (!fs.existsSync(devWatchlistStorePath)) {
      return [] as DevWatchlistEntry[];
    }

    const raw = fs.readFileSync(devWatchlistStorePath, "utf8");
    return JSON.parse(raw) as DevWatchlistEntry[];
  } catch {
    return [] as DevWatchlistEntry[];
  }
}

function saveWatchlistToDisk(items: DevWatchlistEntry[]) {
  try {
    fs.writeFileSync(devWatchlistStorePath, JSON.stringify(items, null, 2), "utf8");
  } catch {
    // best-effort local fallback store
  }
}

export function addDevWatchlistEntry(input: { userId: string; gameSlug: string }) {
  const watchlist = loadWatchlistFromDisk();
  const alreadyExists = watchlist.some((item) => item.userId === input.userId && item.gameSlug === input.gameSlug);

  if (alreadyExists) {
    return null;
  }

  const entry: DevWatchlistEntry = {
    id: crypto.randomUUID(),
    userId: input.userId,
    gameSlug: input.gameSlug,
    createdAt: new Date().toISOString(),
  };

  watchlist.push(entry);
  saveWatchlistToDisk(watchlist);
  return entry;
}

export function listDevWatchlistByUserId(userId: string) {
  return loadWatchlistFromDisk()
    .filter((item) => item.userId === userId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}
