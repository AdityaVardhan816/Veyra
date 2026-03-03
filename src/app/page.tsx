import { GameRow } from "@/components/game-row";
import { HeroBanner } from "@/components/hero-banner";
import { getCatalogGames } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allGames = await getCatalogGames();
  const featuredTitleOrder = [
    "Resident Evil 4",
    "Forza Horizon 5",
    "Dark Souls 3",
    "Alan Wake 2",
    "Baldur's Gate 3",
    "The Witcher 3: Wild Hunt",
    "Red Dead Redemption 2",
    "God of War Ragnarök",
  ];

  const normalize = (value: string) => value.toLowerCase().replaceAll(/[^a-z0-9]+/g, " ").trim();

  const featuredMatches = featuredTitleOrder
    .map((title) => {
      const normalizedRequested = normalize(title);
      return allGames.find((game) => {
        const normalizedTitle = normalize(game.title);
        return normalizedTitle === normalizedRequested || normalizedTitle.includes(normalizedRequested) || normalizedRequested.includes(normalizedTitle);
      });
    })
    .filter((game): game is (typeof allGames)[number] => Boolean(game));

  const featuredGames = [...featuredMatches, ...allGames.filter((game) => !featuredMatches.some((featured) => featured.slug === game.slug))].slice(0, 8);
  const featuredGame = featuredGames[0];
  const trendingGames = allGames.slice(0, 12);
  const topRatedGames = [...allGames].sort((left, right) => right.rating - left.rating).slice(0, 20);
  const newReleases = [...allGames]
    .sort((left, right) => new Date(right.releaseDate).getTime() - new Date(left.releaseDate).getTime())
    .slice(0, 30);

  const byGenre = (genre: string, limit: number) =>
    allGames
      .filter((game) => game.genres.some((item) => item.toLowerCase().includes(genre.toLowerCase())))
      .slice(0, limit);

  const actionGames = byGenre("Action", 18);
  const rpgGames = byGenre("RPG", 22);
  const openWorldGames = byGenre("Open World", 16);
  const shooterGames = byGenre("Shooter", 24);
  const racingGames = byGenre("Racing", 14);
  const horrorGames = byGenre("Horror", 10);
  const strategyGames = byGenre("Strategy", 26);
  const fightingGames = byGenre("Fighting", 27);

  if (!featuredGame) {
    return <div className="rounded-2xl border border-white/10 bg-panel p-6 text-textMuted">No games available yet.</div>;
  }

  return (
    <div className="space-y-10">
      <HeroBanner games={featuredGames} />
      <GameRow title="Trending Now" games={trendingGames} />
      <GameRow title="Top Rated" games={topRatedGames} />
      <GameRow title="New Releases" games={newReleases} />
      <GameRow title="Action Picks" games={actionGames} />
      <GameRow title="RPG Adventures" games={rpgGames} />
      <GameRow title="Open World Journeys" games={openWorldGames} />
      <GameRow title="Shooter Zone" games={shooterGames} />
      <GameRow title="Racing Arena" games={racingGames} />
      <GameRow title="Horror Nights" games={horrorGames} />
      <GameRow title="Strategy Command" games={strategyGames} />
      <GameRow title="Fighting Legends" games={fightingGames} />
    </div>
  );
}
