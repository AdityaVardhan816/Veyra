import fs from "node:fs";
import path from "node:path";

export type DevReview = {
  id: string;
  gameSlug: string;
  userId: string;
  username: string;
  title: string;
  body: string;
  spoiler: boolean;
  stars: number;
  createdAt: string;
};

const devReviewStorePath = path.join(process.cwd(), ".dev-reviews.json");

function loadReviewsFromDisk() {
  try {
    if (!fs.existsSync(devReviewStorePath)) {
      return [] as DevReview[];
    }

    const raw = fs.readFileSync(devReviewStorePath, "utf8");
    return JSON.parse(raw) as DevReview[];
  } catch {
    return [] as DevReview[];
  }
}

function saveReviewsToDisk(reviews: DevReview[]) {
  try {
    fs.writeFileSync(devReviewStorePath, JSON.stringify(reviews, null, 2), "utf8");
  } catch {
    // best-effort local fallback store
  }
}

function hashSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getReviewStarRating(seedInput: string) {
  const seed = hashSeed(seedInput);
  const rating = 3 + (seed % 21) / 10;
  return Number(rating.toFixed(1));
}

export function createDevReview(input: {
  gameSlug: string;
  userId: string;
  username: string;
  title: string;
  body: string;
  spoiler: boolean;
  stars?: number;
}) {
  const reviews = loadReviewsFromDisk();
  const createdAt = new Date().toISOString();

  const review: DevReview = {
    id: crypto.randomUUID(),
    gameSlug: input.gameSlug,
    userId: input.userId,
    username: input.username,
    title: input.title,
    body: input.body,
    spoiler: input.spoiler,
    stars: Number((input.stars ?? getReviewStarRating(`${input.gameSlug}:${input.userId}:${createdAt}`)).toFixed(1)),
    createdAt,
  };

  reviews.push(review);
  saveReviewsToDisk(reviews);

  return review;
}

export function listDevReviewsByGameSlug(gameSlug: string) {
  return loadReviewsFromDisk()
    .filter((review) => review.gameSlug === gameSlug)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function listDevReviewsByUserId(userId: string) {
  return loadReviewsFromDisk()
    .filter((review) => review.userId === userId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}
