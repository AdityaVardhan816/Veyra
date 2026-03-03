import Link from "next/link";
import { getCatalogGames, getFilterOptions } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    platform?: string;
    sort?: "rating" | "release" | "title";
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const allGames = await getCatalogGames();
  const filteredGames = await getCatalogGames({
    query: params.q,
    genre: params.genre,
    platform: params.platform,
    sort: params.sort,
  });

  const { genres, platforms } = getFilterOptions(allGames);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-panel p-5">
        <h1 className="text-2xl font-semibold">Browse Games</h1>
        <p className="mt-1 text-sm text-textMuted">Find games by name, genre, platform, and ranking.</p>
      </div>

      <form className="grid gap-3 rounded-2xl border border-white/10 bg-panel p-4 md:grid-cols-4" action="/search" method="get">
        <input
          type="text"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search title or genre"
          className="rounded-xl border border-white/15 bg-panelSoft px-3 py-2 text-sm text-text outline-none ring-accent/40 focus:ring"
        />

        <select
          name="genre"
          defaultValue={params.genre ?? "all"}
          className="rounded-xl border border-white/15 bg-panelSoft px-3 py-2 text-sm text-text outline-none"
        >
          <option value="all">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <select
          name="platform"
          defaultValue={params.platform ?? "all"}
          className="rounded-xl border border-white/15 bg-panelSoft px-3 py-2 text-sm text-text outline-none"
        >
          <option value="all">All Platforms</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        <select
          name="sort"
          defaultValue={params.sort ?? "rating"}
          className="rounded-xl border border-white/15 bg-panelSoft px-3 py-2 text-sm text-text outline-none"
        >
          <option value="rating">Sort: Top Rated</option>
          <option value="release">Sort: Newest</option>
          <option value="title">Sort: Title A-Z</option>
        </select>

        <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white md:col-span-4">
          Apply Filters
        </button>
      </form>

      <p className="text-sm text-textMuted">{filteredGames.length} result(s)</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGames.map((game) => (
          <Link
            key={game.id}
            href={`/game/${game.slug}`}
            className="overflow-hidden rounded-2xl border border-white/10 bg-panel transition hover:border-accent/60"
          >
            <div className="h-36 w-full overflow-hidden bg-panelSoft">
              {game.bannerUrl || game.coverUrl ? (
                <img
                  src={game.bannerUrl || game.coverUrl}
                  alt={game.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-textMuted">No image</div>
              )}
            </div>
            <div className="p-4">
              <p className="text-base font-semibold">{game.title}</p>
              <p className="mt-1 text-sm text-textMuted">{game.genres.join(" • ")}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-textMuted">
                <span>{game.platforms.join(" / ")}</span>
                <span>{game.rating.toFixed(1)} ★</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
