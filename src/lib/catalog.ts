import { GameStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { games as mockGames } from "@/lib/mock-data";
import { Game } from "@/types/game";

type QueryOptions = {
  query?: string;
  genre?: string;
  platform?: string;
  sort?: "rating" | "release" | "title";
};

function toCatalogGame(game: (typeof mockGames)[number]): Game {
  return {
    ...game,
    trailerCount: 1,
    newsCount: 0,
  };
}

function buildGeneratedImage(title: string, type: "cover" | "banner") {
  return `/api/game-image?type=${type}&title=${encodeURIComponent(title)}`;
}

function resolveFallbackImage(slug: string, title: string, type: "cover" | "banner") {
  const mock = mockGames.find((entry) => entry.slug === slug);

  if (!mock) {
    return buildGeneratedImage(title, type);
  }

  return type === "cover" ? mock.coverUrl || buildGeneratedImage(title, "cover") : mock.bannerUrl || buildGeneratedImage(title, "banner");
}

export async function getCatalogGames(options: QueryOptions = {}): Promise<Game[]> {
  try {
    const dbGames = await prisma.game.findMany({
      where: {
        status: {
          in: [GameStatus.RELEASED, GameStatus.EARLY_ACCESS, GameStatus.UPCOMING],
        },
      },
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
        ratings: { select: { score: true } },
        dlcs: true,
        trailers: true,
        news: true,
      },
    });

    const mapped = dbGames.map((game) => {
      const rating = game.ratings.length > 0 ? game.ratings.reduce((accumulator, item) => accumulator + item.score, 0) / game.ratings.length : 0;

      return {
        id: game.id,
        slug: game.slug,
        title: game.title,
        coverUrl: game.coverUrl ?? resolveFallbackImage(game.slug, game.title, "cover"),
        bannerUrl: game.bannerUrl ?? resolveFallbackImage(game.slug, game.title, "banner"),
        genres: game.genres.map((item) => item.genre.name),
        platforms: game.platforms.map((item) => item.platform.name),
        releaseDate: game.releaseDate.toISOString().slice(0, 10),
        rating,
        ratingsCount: game.ratings.length,
        dlcCount: game.dlcs.length,
        trailerUrl: game.trailers[0]?.videoUrl ?? "https://www.youtube.com",
        trailerCount: game.trailers.length,
        newsCount: game.news.length,
        summary: game.summary,
        tags: [],
      } satisfies Game;
    });

    return applyFiltersAndSort(mapped, options);
  } catch {
    return applyFiltersAndSort(mockGames.map(toCatalogGame), options);
  }
}

function applyFiltersAndSort(items: Game[], options: QueryOptions): Game[] {
  const query = options.query?.trim().toLowerCase();

  let filtered = items.filter((game) => {
    const matchesQuery =
      !query ||
      game.title.toLowerCase().includes(query) ||
      game.summary.toLowerCase().includes(query) ||
      game.genres.some((genre) => genre.toLowerCase().includes(query));

    const matchesGenre = !options.genre || options.genre === "all" || game.genres.includes(options.genre);
    const matchesPlatform = !options.platform || options.platform === "all" || game.platforms.includes(options.platform);

    return matchesQuery && matchesGenre && matchesPlatform;
  });

  const sort = options.sort ?? "rating";
  filtered = [...filtered].sort((left, right) => {
    if (sort === "title") {
      return left.title.localeCompare(right.title);
    }

    if (sort === "release") {
      return new Date(right.releaseDate).getTime() - new Date(left.releaseDate).getTime();
    }

    return right.rating - left.rating;
  });

  return filtered;
}

export function getFilterOptions(items: Game[]) {
  const genres = [...new Set(items.flatMap((game) => game.genres))].sort((left, right) => left.localeCompare(right));
  const platforms = [...new Set(items.flatMap((game) => game.platforms))].sort((left, right) => left.localeCompare(right));

  return { genres, platforms };
}
