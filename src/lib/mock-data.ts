import { Game } from "@/types/game";
import { popularGames } from "@/lib/popular-games";

function buildCoverImage(game: { title: string; slug: string }) {
  const text = encodeURIComponent(game.title);
  return `/api/game-image?type=cover&title=${text}`;
}

function buildBannerImage(game: { title: string; slug: string }) {
  const text = encodeURIComponent(game.title);
  return `/api/game-image?type=banner&title=${text}`;
}

const trailerPool = [
  "https://www.youtube.com/watch?v=AKXiKBnzpBQ",
  "https://www.youtube.com/watch?v=UnA7tepsc7s",
  "https://www.youtube.com/watch?v=hfJ4Km46A-0",
  "https://www.youtube.com/watch?v=1T22wNvoNiU",
  "https://www.youtube.com/watch?v=Cr5rQ1NZ0Tw",
];

const TARGET_GAME_COUNT = 1005;

type GameSeed = Omit<Game, "id" | "coverUrl" | "bannerUrl" | "trailerUrl"> & {
  coverUrl?: string;
  bannerUrl?: string;
  trailerUrl?: string;
};

const gameSeeds: GameSeed[] = [
  {
    slug: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    genres: ["CRPG", "Fantasy"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2023-08-03",
    rating: 9.7,
    ratingsCount: 12540,
    dlcCount: 0,
    summary: "Gather your party and shape your destiny in a deep, reactive role-playing epic.",
    tags: ["rpg", "choices matter", "co-op"],
    featured: true,
  },
  {
    slug: "elden-ring",
    title: "Elden Ring",
    genres: ["Action RPG", "Open World"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2022-02-25",
    rating: 9.6,
    ratingsCount: 14120,
    dlcCount: 1,
    summary: "A vast, dark fantasy world where freedom and challenge blend into a legendary adventure.",
    tags: ["soulslike", "boss fights", "exploration"],
  },
  {
    slug: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    genres: ["Action RPG", "Sci-Fi"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2020-12-10",
    rating: 8.9,
    ratingsCount: 18521,
    dlcCount: 1,
    summary: "Build your legend in Night City, a sprawling open world driven by style, cyberware, and choices.",
    tags: ["story rich", "futuristic", "open world"],
  },
  {
    slug: "god-of-war-ragnarok",
    title: "God of War Ragnarök",
    genres: ["Action", "Adventure"],
    platforms: ["PS5", "PS4", "PC"],
    releaseDate: "2022-11-09",
    rating: 9.4,
    ratingsCount: 9622,
    dlcCount: 0,
    summary: "Kratos and Atreus face prophecy and gods in a cinematic journey across the Nine Realms.",
    tags: ["cinematic", "story", "mythology"],
  },
  {
    slug: "black-myth-wukong",
    title: "Black Myth: Wukong",
    genres: ["Action", "Mythology"],
    platforms: ["PC", "PS5"],
    releaseDate: "2024-08-20",
    rating: 8.8,
    ratingsCount: 5130,
    dlcCount: 0,
    summary: "A high-intensity action adventure inspired by Journey to the West.",
    tags: ["boss rush", "mythology", "action"],
  },
  {
    slug: "red-dead-redemption-2",
    title: "Red Dead Redemption 2",
    genres: ["Open World", "Adventure"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2018-10-26",
    rating: 9.5,
    ratingsCount: 23100,
    dlcCount: 0,
    summary: "An epic tale of outlaw life in a vast and fading American frontier.",
    tags: ["western", "story rich", "immersive"],
  },
  {
    slug: "the-witcher-3-wild-hunt",
    title: "The Witcher 3: Wild Hunt",
    genres: ["Action RPG", "Fantasy"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    releaseDate: "2015-05-19",
    rating: 9.5,
    ratingsCount: 28740,
    dlcCount: 2,
    summary: "Hunt monsters and shape kingdoms in a richly written fantasy world.",
    tags: ["open world", "story", "rpg"],
  },
  {
    slug: "grand-theft-auto-v",
    title: "Grand Theft Auto V",
    genres: ["Open World", "Action"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2013-09-17",
    rating: 9.2,
    ratingsCount: 40120,
    dlcCount: 0,
    summary: "Three protagonists collide in a sprawling satirical crime sandbox.",
    tags: ["sandbox", "action", "crime"],
  },
  {
    slug: "sekiro-shadows-die-twice",
    title: "Sekiro: Shadows Die Twice",
    genres: ["Action", "Soulslike"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2019-03-22",
    rating: 9.1,
    ratingsCount: 11840,
    dlcCount: 0,
    summary: "Master precision sword combat in a brutal shinobi revenge story.",
    tags: ["parry", "samurai", "boss fights"],
  },
  {
    slug: "ghost-of-tsushima",
    title: "Ghost of Tsushima",
    genres: ["Action", "Open World"],
    platforms: ["PS5", "PC"],
    releaseDate: "2020-07-17",
    rating: 9.0,
    ratingsCount: 10220,
    dlcCount: 1,
    summary: "A samurai epic about honor, adaptation, and rebellion on Tsushima island.",
    tags: ["samurai", "open world", "stealth"],
  },
  {
    slug: "horizon-forbidden-west",
    title: "Horizon Forbidden West",
    genres: ["Action RPG", "Open World"],
    platforms: ["PS5", "PC"],
    releaseDate: "2022-02-18",
    rating: 8.9,
    ratingsCount: 7310,
    dlcCount: 1,
    summary: "Aloy journeys west to battle new machine threats in breathtaking biomes.",
    tags: ["post-apocalyptic", "machines", "adventure"],
  },
  {
    slug: "marvels-spider-man-2",
    title: "Marvel's Spider-Man 2",
    genres: ["Action", "Superhero"],
    platforms: ["PS5"],
    releaseDate: "2023-10-20",
    rating: 8.8,
    ratingsCount: 7820,
    dlcCount: 0,
    summary: "Peter and Miles face darker threats in a larger, faster New York.",
    tags: ["superhero", "story", "open world"],
  },
  {
    slug: "starfield",
    title: "Starfield",
    genres: ["RPG", "Sci-Fi"],
    platforms: ["PC", "Xbox"],
    releaseDate: "2023-09-06",
    rating: 8.1,
    ratingsCount: 9670,
    dlcCount: 1,
    summary: "Explore a massive galaxy, build ships, and chart your own path among the stars.",
    tags: ["space", "rpg", "exploration"],
  },
  {
    slug: "resident-evil-4-remake",
    title: "Resident Evil 4",
    genres: ["Survival Horror", "Action"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2023-03-24",
    rating: 9.1,
    ratingsCount: 8540,
    dlcCount: 1,
    summary: "A modern reimagining of a genre-defining survival horror classic.",
    tags: ["horror", "remake", "action"],
  },
  {
    slug: "helldivers-2",
    title: "Helldivers 2",
    genres: ["Co-op Shooter", "Action"],
    platforms: ["PC", "PS5"],
    releaseDate: "2024-02-08",
    rating: 8.7,
    ratingsCount: 6210,
    dlcCount: 0,
    summary: "Team up for chaotic co-op warfare in a satirical galactic conflict.",
    tags: ["co-op", "shooter", "live service"],
  },
  {
    slug: "hades-2",
    title: "Hades II",
    genres: ["Roguelike", "Action"],
    platforms: ["PC"],
    releaseDate: "2024-05-06",
    rating: 9.2,
    ratingsCount: 4120,
    dlcCount: 0,
    summary: "Descend into the underworld again in a fast-paced mythological roguelike sequel.",
    tags: ["indie", "roguelike", "mythology"],
  },
  {
    slug: "palworld",
    title: "Palworld",
    genres: ["Survival", "Open World"],
    platforms: ["PC", "Xbox"],
    releaseDate: "2024-01-19",
    rating: 7.9,
    ratingsCount: 5340,
    dlcCount: 0,
    summary: "Catch creatures, build bases, and survive in a strange monster-filled world.",
    tags: ["survival", "crafting", "creatures"],
  },
  {
    slug: "final-fantasy-vii-rebirth",
    title: "Final Fantasy VII Rebirth",
    genres: ["JRPG", "Action RPG"],
    platforms: ["PS5", "PC"],
    releaseDate: "2024-02-29",
    rating: 9.0,
    ratingsCount: 4470,
    dlcCount: 0,
    summary: "Cloud and party continue their journey in a reimagined classic epic.",
    tags: ["jrpg", "story", "party"],
  },
  {
    slug: "hogwarts-legacy",
    title: "Hogwarts Legacy",
    genres: ["Action RPG", "Open World"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    releaseDate: "2023-02-10",
    rating: 8.5,
    ratingsCount: 11210,
    dlcCount: 0,
    summary: "Live the wizarding school fantasy in a magical open-world adventure.",
    tags: ["magic", "open world", "fantasy"],
  },
  {
    slug: "monster-hunter-world",
    title: "Monster Hunter: World",
    genres: ["Action RPG", "Co-op"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2018-01-26",
    rating: 8.9,
    ratingsCount: 13900,
    dlcCount: 1,
    summary: "Track and hunt massive creatures in tactical, gear-driven battles.",
    tags: ["co-op", "boss hunts", "loot"],
  },
  {
    slug: "alan-wake-2",
    title: "Alan Wake 2",
    genres: ["Horror", "Narrative"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2023-10-27",
    rating: 8.8,
    ratingsCount: 4160,
    dlcCount: 1,
    summary: "A psychological horror thriller blending mystery, survival, and cinematic storytelling.",
    tags: ["horror", "story", "thriller"],
  },
  {
    slug: "lies-of-p",
    title: "Lies of P",
    genres: ["Soulslike", "Action RPG"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2023-09-19",
    rating: 8.4,
    ratingsCount: 3880,
    dlcCount: 0,
    summary: "A dark Belle Époque soulslike inspired by the Pinocchio myth.",
    tags: ["soulslike", "dark fantasy", "boss fights"],
  },
  {
    slug: "forza-horizon-5",
    title: "Forza Horizon 5",
    genres: ["Racing", "Open World"],
    platforms: ["PC", "Xbox"],
    releaseDate: "2021-11-09",
    rating: 8.9,
    ratingsCount: 9800,
    dlcCount: 2,
    summary: "Drive hundreds of cars across vibrant biomes in an open-world festival.",
    tags: ["racing", "cars", "open world"],
  },
  {
    slug: "counter-strike-2",
    title: "Counter-Strike 2",
    genres: ["Competitive Shooter", "FPS"],
    platforms: ["PC"],
    releaseDate: "2023-09-27",
    rating: 8.0,
    ratingsCount: 21400,
    dlcCount: 0,
    summary: "Tactical 5v5 firefights with precise gunplay and high-skill team strategy.",
    tags: ["fps", "esports", "multiplayer"],
  },
  {
    slug: "persona-5-royal",
    title: "Persona 5 Royal",
    genres: ["JRPG", "Turn-Based"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    releaseDate: "2022-10-21",
    rating: 9.1,
    ratingsCount: 7450,
    dlcCount: 0,
    summary: "Lead the Phantom Thieves through stylish dungeons and social life drama.",
    tags: ["jrpg", "anime", "story"],
  },
  {
    slug: "control",
    title: "Control",
    genres: ["Action", "Sci-Fi"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2019-08-27",
    rating: 8.6,
    ratingsCount: 5920,
    dlcCount: 2,
    summary: "Wield supernatural powers in a shifting brutalist headquarters full of mystery.",
    tags: ["third-person", "powers", "narrative"],
  },
  {
    slug: "no-mans-sky",
    title: "No Man's Sky",
    genres: ["Survival", "Sci-Fi"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    releaseDate: "2016-08-09",
    rating: 8.4,
    ratingsCount: 10380,
    dlcCount: 0,
    summary: "Explore an enormous procedural universe with base-building and co-op exploration.",
    tags: ["space", "survival", "exploration"],
  },
  {
    slug: "dragons-dogma-2",
    title: "Dragon's Dogma 2",
    genres: ["Action RPG", "Fantasy"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2024-03-22",
    rating: 8.6,
    ratingsCount: 4360,
    dlcCount: 0,
    summary: "Forge your path as the Arisen in a reactive fantasy world of towering monsters and dynamic companions.",
    tags: ["fantasy", "open world", "party"],
  },
  {
    slug: "diablo-iv",
    title: "Diablo IV",
    genres: ["Action RPG", "Dark Fantasy"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2023-06-05",
    rating: 8.3,
    ratingsCount: 10240,
    dlcCount: 1,
    summary: "Battle demonic hordes in a dark shared-world action RPG built around classes, loot, and endgame progression.",
    tags: ["loot", "dungeons", "co-op"],
  },
  {
    slug: "metaphor-refantazio",
    title: "Metaphor: ReFantazio",
    genres: ["JRPG", "Turn-Based"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2024-10-11",
    rating: 9.0,
    ratingsCount: 2980,
    dlcCount: 0,
    summary: "A stylish fantasy journey blending social bonds, tactical turn-based combat, and kingdom-scale stakes.",
    tags: ["jrpg", "story", "turn-based"],
  },
  {
    slug: "space-marine-2",
    title: "Warhammer 40,000: Space Marine 2",
    genres: ["Action", "Shooter"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2024-09-09",
    rating: 8.5,
    ratingsCount: 3520,
    dlcCount: 0,
    summary: "Cut through Tyranid swarms in brutal third-person action set in the grim darkness of the far future.",
    tags: ["action", "co-op", "sci-fi"],
  },
  {
    slug: "path-of-exile-2",
    title: "Path of Exile 2",
    genres: ["Action RPG", "Hack and Slash"],
    platforms: ["PC"],
    releaseDate: "2024-12-06",
    rating: 8.8,
    ratingsCount: 2210,
    dlcCount: 0,
    summary: "Carve through a sprawling dark world with deep class customization and loot-heavy ARPG combat.",
    tags: ["arpg", "loot", "dark fantasy"],
  },
  {
    slug: "assassins-creed-shadows",
    title: "Assassin's Creed Shadows",
    genres: ["Action RPG", "Stealth"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2026-03-20",
    rating: 8.2,
    ratingsCount: 1200,
    dlcCount: 0,
    summary: "Feudal Japan stealth-action adventure featuring dual protagonists.",
    tags: ["stealth", "historical", "open world"],
  },
  {
    slug: "marvel-rivals",
    title: "Marvel Rivals",
    genres: ["Hero Shooter", "Multiplayer"],
    platforms: ["PC", "PS5", "Xbox"],
    releaseDate: "2025-12-01",
    rating: 7.8,
    ratingsCount: 1900,
    dlcCount: 0,
    summary: "Fast team-based hero battles with iconic Marvel characters.",
    tags: ["hero shooter", "multiplayer", "pvp"],
  },
  {
    slug: "death-stranding-2",
    title: "Death Stranding 2",
    genres: ["Action", "Adventure"],
    platforms: ["PS5"],
    releaseDate: "2025-11-15",
    rating: 8.6,
    ratingsCount: 1600,
    dlcCount: 0,
    summary: "A surreal, cinematic journey through a fractured world of connections.",
    tags: ["cinematic", "open world", "narrative"],
  },
  {
    slug: "hollow-knight-silksong",
    title: "Hollow Knight: Silksong",
    genres: ["Metroidvania", "Indie"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    releaseDate: "2026-09-01",
    rating: 8.9,
    ratingsCount: 900,
    dlcCount: 0,
    summary: "Explore a haunted kingdom in a fast, precise hand-crafted platforming adventure.",
    tags: ["indie", "platformer", "metroidvania"],
  },
  ...popularGames.map((game) => ({
    slug: game.slug,
    title: game.title,
    genres: game.genres,
    platforms: game.platforms,
    releaseDate: game.releaseDate,
    rating: game.rating,
    ratingsCount: game.ratingsCount,
    dlcCount: game.dlcCount ?? 0,
    summary: game.summary,
    tags: game.tags,
  })),
];

function expandGameSeedsToTarget(baseSeeds: GameSeed[], targetCount: number) {
  if (baseSeeds.length >= targetCount) {
    return baseSeeds;
  }

  const expanded = [...baseSeeds];
  const knownSlugs = new Set(expanded.map((seed) => seed.slug));
  const templates = popularGames.map((game) => ({
    slug: game.slug,
    title: game.title,
    genres: game.genres,
    platforms: game.platforms,
    releaseDate: game.releaseDate,
    rating: game.rating,
    ratingsCount: game.ratingsCount,
    dlcCount: game.dlcCount ?? 0,
    summary: game.summary,
    tags: game.tags,
  } satisfies GameSeed));

  let cycle = 1;

  while (expanded.length < targetCount) {
    for (const template of templates) {
      if (expanded.length >= targetCount) {
        break;
      }

      const slug = `${template.slug}-collection-${cycle}`;

      if (knownSlugs.has(slug)) {
        continue;
      }

      const ratingShift = ((cycle % 7) - 3) * 0.1;
      const rating = Number(Math.max(6.8, Math.min(9.9, template.rating + ratingShift)).toFixed(1));

      expanded.push({
        ...template,
        slug,
        title: `${template.title} Collection ${cycle}`,
        rating,
        ratingsCount: template.ratingsCount + cycle * 12,
      });

      knownSlugs.add(slug);
    }

    cycle += 1;
  }

  return expanded;
}

const expandedGameSeeds = expandGameSeedsToTarget(gameSeeds, TARGET_GAME_COUNT);

export const games: Game[] = expandedGameSeeds.map((seed, index) => {
  return {
    ...seed,
    id: String(index + 1),
    coverUrl: seed.coverUrl ?? buildCoverImage(seed),
    bannerUrl: seed.bannerUrl ?? buildBannerImage(seed),
    trailerUrl: seed.trailerUrl ?? trailerPool[index % trailerPool.length],
  };
});

export const featuredGame = games.find((game) => game.featured) ?? games[0];

export const trendingGames = games.slice(0, 12);
export const topRatedGames = [...games].sort((a, b) => b.rating - a.rating);
export const newReleases = [...games].sort((a, b) =>
  new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
);
