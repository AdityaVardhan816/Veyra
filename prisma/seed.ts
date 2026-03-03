import { GameStatus, PrismaClient } from "@prisma/client";
import { popularGames } from "../src/lib/popular-games";

const prisma = new PrismaClient();

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
  "https://www.youtube.com/watch?v=sJbexcm4Trk",
];

const reviewTitleTemplates = [
  "Excellent gameplay loop",
  "Strong mechanics and polish",
  "Better than expected",
  "Great with friends",
  "Solid post-launch support",
  "Atmosphere is top-tier",
  "Worth your time",
  "A few flaws, still great",
  "Immersive and replayable",
  "Surprisingly addictive",
];

const reviewBodyTemplates = [
  "The core gameplay feels responsive and rewarding. Progression pacing is good and the overall package stays fun for long sessions.",
  "Presentation, sound design, and controls are all in a good place. There are a few rough edges but the highs easily outweigh them.",
  "This title has strong moment-to-moment action and enough build variety to keep things fresh over multiple runs.",
  "Co-op and social features make this one shine. Match flow is smooth and it is easy to jump in for quick sessions.",
  "Content updates have added meaningful improvements. It now feels much more complete and stable than at launch.",
  "Exploration and world design are standouts. The game rewards curiosity and has plenty of memorable sequences.",
  "Combat depth and encounter design are excellent. Learning the systems feels satisfying and mastery is genuinely fun.",
  "Performance is generally stable and visual style is cohesive. UI readability could improve, but it does the job overall.",
  "Story delivery and character work are stronger than expected. Even side content feels thoughtfully integrated.",
  "It balances accessibility with depth well. New players can onboard quickly while experienced players still have room to optimize.",
];

const newsSourceTemplates = [
  { name: "Reddit", url: "https://www.reddit.com/search/?q=" },
  { name: "IGN", url: "https://www.ign.com/search?q=" },
  { name: "GameSpot", url: "https://www.gamespot.com/search/?q=" },
  { name: "Eurogamer", url: "https://www.eurogamer.net/search?q=" },
  { name: "PC Gamer", url: "https://www.pcgamer.com/search/?searchTerm=" },
  { name: "Rock Paper Shotgun", url: "https://www.rockpapershotgun.com/search?q=" },
];

const dlcTitleSuffixes = ["Season Pass", "Expansion Pack", "Story Chapter", "Cosmetic Bundle", "Challenge Update"];

function hashSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pick<T>(items: T[], seed: number) {
  return items[seed % items.length];
}

async function ensureReviewUsers(total: number) {
  const users = [] as Array<{ id: string }>;

  for (let index = 1; index <= total; index += 1) {
    const username = `player_${String(index).padStart(3, "0")}`;
    const email = `${username}@veyra.dev`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        username,
        name: username,
      },
      create: {
        email,
        username,
        name: username,
      },
      select: { id: true },
    });

    users.push(user);
  }

  return users;
}

type SeedGame = {
  slug: string;
  title: string;
  summary: string;
  releaseDate: Date;
  status: GameStatus;
  genres: string[];
  platforms: string[];
  dlcs?: Array<{ title: string; releaseDate?: Date; summary?: string }>;
  leakHint?: boolean;
};

const seedGames: SeedGame[] = [
  {
    slug: "elden-ring",
    title: "Elden Ring",
    summary: "A vast, dark fantasy world where freedom and challenge blend into a legendary adventure.",
    releaseDate: new Date("2022-02-25"),
    status: GameStatus.RELEASED,
    genres: ["Action RPG", "Open World"],
    platforms: ["PC", "PS5", "Xbox"],
    dlcs: [{ title: "Shadow of the Erdtree", releaseDate: new Date("2024-06-21"), summary: "A major expansion set in the Realm of Shadow." }],
    leakHint: true,
  },
  {
    slug: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    summary: "Build your legend in Night City, a sprawling open world driven by style, cyberware, and choices.",
    releaseDate: new Date("2020-12-10"),
    status: GameStatus.RELEASED,
    genres: ["Action RPG", "Sci-Fi"],
    platforms: ["PC", "PS5", "Xbox"],
    dlcs: [{ title: "Phantom Liberty", releaseDate: new Date("2023-09-26"), summary: "A spy-thriller expansion in Dogtown." }],
  },
  {
    slug: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    summary: "Gather your party and shape your destiny in a deep, reactive role-playing epic.",
    releaseDate: new Date("2023-08-03"),
    status: GameStatus.RELEASED,
    genres: ["CRPG", "Fantasy"],
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "god-of-war-ragnarok",
    title: "God of War Ragnarök",
    summary: "Kratos and Atreus face prophecy and gods in a cinematic journey across the Nine Realms.",
    releaseDate: new Date("2022-11-09"),
    status: GameStatus.RELEASED,
    genres: ["Action", "Adventure"],
    platforms: ["PS5", "PS4", "PC"],
  },
  {
    slug: "black-myth-wukong",
    title: "Black Myth: Wukong",
    summary: "A high-intensity action adventure inspired by Journey to the West.",
    releaseDate: new Date("2024-08-20"),
    status: GameStatus.RELEASED,
    genres: ["Action", "Mythology"],
    platforms: ["PC", "PS5"],
  },
  {
    slug: "red-dead-redemption-2",
    title: "Red Dead Redemption 2",
    summary: "An epic tale of outlaw life in a vast and fading frontier.",
    releaseDate: new Date("2018-10-26"),
    status: GameStatus.RELEASED,
    genres: ["Open World", "Adventure"],
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "the-witcher-3-wild-hunt",
    title: "The Witcher 3: Wild Hunt",
    summary: "Hunt monsters and shape kingdoms in a richly written fantasy world.",
    releaseDate: new Date("2015-05-19"),
    status: GameStatus.RELEASED,
    genres: ["Action RPG", "Fantasy"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
    dlcs: [
      { title: "Hearts of Stone", summary: "A narrative expansion with dark fairy tale themes." },
      { title: "Blood and Wine", summary: "A full region-sized expansion in Toussaint." },
    ],
  },
  {
    slug: "grand-theft-auto-v",
    title: "Grand Theft Auto V",
    summary: "Three protagonists collide in a sprawling satirical crime sandbox.",
    releaseDate: new Date("2013-09-17"),
    status: GameStatus.RELEASED,
    genres: ["Open World", "Action"],
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "sekiro-shadows-die-twice",
    title: "Sekiro: Shadows Die Twice",
    summary: "Master precision sword combat in a brutal shinobi revenge story.",
    releaseDate: new Date("2019-03-22"),
    status: GameStatus.RELEASED,
    genres: ["Action", "Soulslike"],
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "ghost-of-tsushima",
    title: "Ghost of Tsushima",
    summary: "A samurai epic about honor, adaptation, and rebellion on Tsushima island.",
    releaseDate: new Date("2020-07-17"),
    status: GameStatus.RELEASED,
    genres: ["Action", "Open World"],
    platforms: ["PS5", "PC"],
    dlcs: [{ title: "Iki Island", summary: "An additional island storyline for Jin." }],
  },
  {
    slug: "horizon-forbidden-west",
    title: "Horizon Forbidden West",
    summary: "Aloy journeys west to battle new machine threats in breathtaking biomes.",
    releaseDate: new Date("2022-02-18"),
    status: GameStatus.RELEASED,
    genres: ["Action RPG", "Open World"],
    platforms: ["PS5", "PC"],
    dlcs: [{ title: "Burning Shores", summary: "Post-story expansion in volcanic ruins." }],
  },
  {
    slug: "starfield",
    title: "Starfield",
    summary: "Explore a massive galaxy and chart your own path among the stars.",
    releaseDate: new Date("2023-09-06"),
    status: GameStatus.RELEASED,
    genres: ["RPG", "Sci-Fi"],
    platforms: ["PC", "Xbox"],
  },
  {
    slug: "resident-evil-4-remake",
    title: "Resident Evil 4",
    summary: "A modern reimagining of a genre-defining survival horror classic.",
    releaseDate: new Date("2023-03-24"),
    status: GameStatus.RELEASED,
    genres: ["Survival Horror", "Action"],
    platforms: ["PC", "PS5", "Xbox"],
    dlcs: [{ title: "Separate Ways", summary: "Ada Wong side campaign expansion." }],
  },
  {
    slug: "helldivers-2",
    title: "Helldivers 2",
    summary: "Team up for chaotic co-op warfare in a satirical galactic conflict.",
    releaseDate: new Date("2024-02-08"),
    status: GameStatus.RELEASED,
    genres: ["Co-op Shooter", "Action"],
    platforms: ["PC", "PS5"],
  },
  {
    slug: "hades-2",
    title: "Hades II",
    summary: "Descend into the underworld again in a fast-paced mythological roguelike sequel.",
    releaseDate: new Date("2024-05-06"),
    status: GameStatus.EARLY_ACCESS,
    genres: ["Roguelike", "Action"],
    platforms: ["PC"],
  },
  {
    slug: "palworld",
    title: "Palworld",
    summary: "Catch creatures, build bases, and survive in a strange monster-filled world.",
    releaseDate: new Date("2024-01-19"),
    status: GameStatus.EARLY_ACCESS,
    genres: ["Survival", "Open World"],
    platforms: ["PC", "Xbox"],
  },
  {
    slug: "final-fantasy-vii-rebirth",
    title: "Final Fantasy VII Rebirth",
    summary: "Cloud and party continue their journey in a reimagined classic epic.",
    releaseDate: new Date("2024-02-29"),
    status: GameStatus.RELEASED,
    genres: ["JRPG", "Action RPG"],
    platforms: ["PS5", "PC"],
  },
  {
    slug: "hogwarts-legacy",
    title: "Hogwarts Legacy",
    summary: "Live the wizarding school fantasy in a magical open-world adventure.",
    releaseDate: new Date("2023-02-10"),
    status: GameStatus.RELEASED,
    genres: ["Action RPG", "Open World"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
  },
  {
    slug: "monster-hunter-world",
    title: "Monster Hunter: World",
    summary: "Track and hunt massive creatures in tactical, gear-driven battles.",
    releaseDate: new Date("2018-01-26"),
    status: GameStatus.RELEASED,
    genres: ["Action RPG", "Co-op"],
    platforms: ["PC", "PS5", "Xbox"],
    dlcs: [{ title: "Iceborne", summary: "A major expansion with new monsters and gear." }],
  },
  {
    slug: "alan-wake-2",
    title: "Alan Wake 2",
    summary: "A psychological horror thriller blending mystery, survival, and cinematic storytelling.",
    releaseDate: new Date("2023-10-27"),
    status: GameStatus.RELEASED,
    genres: ["Horror", "Narrative"],
    platforms: ["PC", "PS5", "Xbox"],
    dlcs: [{ title: "Night Springs", summary: "Additional surreal campaign episodes." }],
    leakHint: true,
  },
  {
    slug: "lies-of-p",
    title: "Lies of P",
    summary: "A dark Belle Époque soulslike inspired by the Pinocchio myth.",
    releaseDate: new Date("2023-09-19"),
    status: GameStatus.RELEASED,
    genres: ["Soulslike", "Action RPG"],
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "forza-horizon-5",
    title: "Forza Horizon 5",
    summary: "Drive hundreds of cars across vibrant biomes in an open-world festival.",
    releaseDate: new Date("2021-11-09"),
    status: GameStatus.RELEASED,
    genres: ["Racing", "Open World"],
    platforms: ["PC", "Xbox"],
    dlcs: [
      { title: "Hot Wheels", summary: "High-speed stunt tracks with vertical loops." },
      { title: "Rally Adventure", summary: "Off-road expansion focused on rally events." },
    ],
  },
  {
    slug: "counter-strike-2",
    title: "Counter-Strike 2",
    summary: "Tactical 5v5 firefights with precise gunplay and high-skill team strategy.",
    releaseDate: new Date("2023-09-27"),
    status: GameStatus.RELEASED,
    genres: ["Competitive Shooter", "FPS"],
    platforms: ["PC"],
  },
  {
    slug: "persona-5-royal",
    title: "Persona 5 Royal",
    summary: "Lead the Phantom Thieves through stylish dungeons and social life drama.",
    releaseDate: new Date("2022-10-21"),
    status: GameStatus.RELEASED,
    genres: ["JRPG", "Turn-Based"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
  },
  {
    slug: "control",
    title: "Control",
    summary: "Wield supernatural powers in a shifting headquarters full of mystery.",
    releaseDate: new Date("2019-08-27"),
    status: GameStatus.RELEASED,
    genres: ["Action", "Sci-Fi"],
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "no-mans-sky",
    title: "No Man's Sky",
    summary: "Explore a huge procedural universe with base-building and co-op discovery.",
    releaseDate: new Date("2016-08-09"),
    status: GameStatus.RELEASED,
    genres: ["Survival", "Sci-Fi"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
  },
  {
    slug: "dragons-dogma-2",
    title: "Dragon's Dogma 2",
    summary: "Forge your path as the Arisen in a reactive fantasy world of towering monsters and dynamic companions.",
    releaseDate: new Date("2024-03-22"),
    status: GameStatus.RELEASED,
    genres: ["Action RPG", "Fantasy"],
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "diablo-iv",
    title: "Diablo IV",
    summary: "Battle demonic hordes in a dark shared-world action RPG built around classes, loot, and endgame progression.",
    releaseDate: new Date("2023-06-05"),
    status: GameStatus.RELEASED,
    genres: ["Action RPG", "Dark Fantasy"],
    platforms: ["PC", "PS5", "Xbox"],
    dlcs: [{ title: "Vessel of Hatred", releaseDate: new Date("2024-10-08"), summary: "A major expansion introducing a new region and class." }],
  },
  {
    slug: "metaphor-refantazio",
    title: "Metaphor: ReFantazio",
    summary: "A stylish fantasy journey blending social bonds, tactical turn-based combat, and kingdom-scale stakes.",
    releaseDate: new Date("2024-10-11"),
    status: GameStatus.RELEASED,
    genres: ["JRPG", "Turn-Based"],
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "space-marine-2",
    title: "Warhammer 40,000: Space Marine 2",
    summary: "Cut through Tyranid swarms in brutal third-person action set in the grim darkness of the far future.",
    releaseDate: new Date("2024-09-09"),
    status: GameStatus.RELEASED,
    genres: ["Action", "Shooter"],
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "path-of-exile-2",
    title: "Path of Exile 2",
    summary: "Carve through a sprawling dark world with deep class customization and loot-heavy ARPG combat.",
    releaseDate: new Date("2024-12-06"),
    status: GameStatus.EARLY_ACCESS,
    genres: ["Action RPG", "Hack and Slash"],
    platforms: ["PC"],
  },
  {
    slug: "assassins-creed-shadows",
    title: "Assassin's Creed Shadows",
    summary: "Feudal Japan stealth-action adventure featuring dual protagonists.",
    releaseDate: new Date("2026-03-20"),
    status: GameStatus.UPCOMING,
    genres: ["Action RPG", "Stealth"],
    platforms: ["PC", "PS5", "Xbox"],
    leakHint: true,
  },
  {
    slug: "marvel-rivals",
    title: "Marvel Rivals",
    summary: "Fast team-based hero battles with iconic Marvel characters.",
    releaseDate: new Date("2025-12-01"),
    status: GameStatus.UPCOMING,
    genres: ["Hero Shooter", "Multiplayer"],
    platforms: ["PC", "PS5", "Xbox"],
  },
  {
    slug: "death-stranding-2",
    title: "Death Stranding 2",
    summary: "A surreal cinematic journey through a fractured world of connections.",
    releaseDate: new Date("2025-11-15"),
    status: GameStatus.UPCOMING,
    genres: ["Action", "Adventure"],
    platforms: ["PS5"],
  },
  {
    slug: "hollow-knight-silksong",
    title: "Hollow Knight: Silksong",
    summary: "Explore a haunted kingdom in a hand-crafted metroidvania adventure.",
    releaseDate: new Date("2026-09-01"),
    status: GameStatus.UPCOMING,
    genres: ["Metroidvania", "Indie"],
    platforms: ["PC", "PS5", "Xbox", "Switch"],
  },
  ...popularGames.map((game) => ({
    slug: game.slug,
    title: game.title,
    summary: game.summary,
    releaseDate: new Date(game.releaseDate),
    status: GameStatus[game.status],
    genres: game.genres,
    platforms: game.platforms,
  })),
];

async function upsertTaxonomy(name: string, model: "genre" | "platform") {
  if (model === "genre") {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
    return;
  }

  await prisma.platform.upsert({ where: { name }, update: {}, create: { name } });
}

async function seed() {
  const reviewUsers = await ensureReviewUsers(260);

  for (const gameData of seedGames) {
    const gameIndex = seedGames.indexOf(gameData);
    const seed = hashSeed(gameData.slug);

    for (const genre of gameData.genres) {
      await upsertTaxonomy(genre, "genre");
    }

    for (const platform of gameData.platforms) {
      await upsertTaxonomy(platform, "platform");
    }

    const game = await prisma.game.upsert({
      where: { slug: gameData.slug },
      update: {
        title: gameData.title,
        summary: gameData.summary,
        releaseDate: gameData.releaseDate,
        coverUrl: buildCoverImage(gameData),
        bannerUrl: buildBannerImage(gameData),
        status: gameData.status,
      },
      create: {
        slug: gameData.slug,
        title: gameData.title,
        summary: gameData.summary,
        releaseDate: gameData.releaseDate,
        coverUrl: buildCoverImage(gameData),
        bannerUrl: buildBannerImage(gameData),
        status: gameData.status,
      },
    });

    await prisma.gameGenre.deleteMany({ where: { gameId: game.id } });
    await prisma.gamePlatform.deleteMany({ where: { gameId: game.id } });
    await prisma.trailer.deleteMany({ where: { gameId: game.id } });
    await prisma.dlc.deleteMany({ where: { gameId: game.id } });
    await prisma.newsItem.deleteMany({ where: { gameId: game.id } });
    await prisma.moderationLog.deleteMany({ where: { review: { gameId: game.id } } });
    await prisma.report.deleteMany({ where: { review: { gameId: game.id } } });
    await prisma.review.deleteMany({ where: { gameId: game.id } });

    for (const genreName of gameData.genres) {
      const genre = await prisma.genre.findUniqueOrThrow({ where: { name: genreName } });
      await prisma.gameGenre.create({ data: { gameId: game.id, genreId: genre.id } });
    }

    for (const platformName of gameData.platforms) {
      const platform = await prisma.platform.findUniqueOrThrow({ where: { name: platformName } });
      await prisma.gamePlatform.create({ data: { gameId: game.id, platformId: platform.id } });
    }

    const trailerCount = 3 + (seed % 2);
    for (let trailerIndex = 0; trailerIndex < trailerCount; trailerIndex += 1) {
      const trailerKind = trailerIndex === 0 ? "Official Trailer" : trailerIndex === 1 ? "Gameplay Trailer" : "Launch Trailer";

      await prisma.trailer.create({
        data: {
          gameId: game.id,
          title: `${gameData.title} ${trailerKind}`,
          videoUrl: trailerPool[(gameIndex + trailerIndex) % trailerPool.length],
          provider: "YouTube",
          publishedAt: new Date(new Date(gameData.releaseDate).getTime() - (120 - trailerIndex * 30) * 24 * 60 * 60 * 1000),
        },
      });
    }

    for (const dlc of gameData.dlcs ?? []) {
      await prisma.dlc.create({ data: { gameId: game.id, ...dlc } });
    }

    const generatedDlcCount = 2 + (seed % 3);
    for (let dlcIndex = 0; dlcIndex < generatedDlcCount; dlcIndex += 1) {
      const suffix = pick(dlcTitleSuffixes, seed + dlcIndex);
      await prisma.dlc.create({
        data: {
          gameId: game.id,
          title: `${gameData.title} ${suffix} ${dlcIndex + 1}`,
          summary: `${gameData.title} content drop featuring new objectives, rewards, and progression updates.`,
          releaseDate: new Date(new Date(gameData.releaseDate).getTime() + (60 + dlcIndex * 75) * 24 * 60 * 60 * 1000),
        },
      });
    }

    for (let newsIndex = 0; newsIndex < 5; newsIndex += 1) {
      const source = pick(newsSourceTemplates, seed + newsIndex);
      const isLeak = newsIndex >= 3 || Boolean(gameData.leakHint);
      const newsQuery = encodeURIComponent(`${gameData.title} ${isLeak ? "leak rumor" : "news update"}`);

      await prisma.newsItem.create({
        data: {
          gameId: game.id,
          title: isLeak ? `${gameData.title} leak roundup #${newsIndex - 2}` : `${gameData.title} community update #${newsIndex + 1}`,
          body: isLeak
            ? `Roundup of unconfirmed reports for ${gameData.title}, including community speculation and insider chatter.`
            : `Latest verified updates for ${gameData.title}, including patch notes, events, and community highlights.`,
          sourceName: source.name,
          sourceUrl: `${source.url}${newsQuery}`,
          isLeak,
          publishedAt: new Date(Date.now() - (gameIndex * 3 + newsIndex) * 24 * 60 * 60 * 1000),
        },
      });
    }

    const reviewCount = 8 + (seed % 13);
    for (let reviewIndex = 0; reviewIndex < reviewCount; reviewIndex += 1) {
      const reviewer = reviewUsers[(gameIndex * 17 + reviewIndex) % reviewUsers.length];
      const titleTemplate = pick(reviewTitleTemplates, seed + reviewIndex);
      const bodyTemplate = pick(reviewBodyTemplates, seed + reviewIndex * 3);

      await prisma.review.create({
        data: {
          userId: reviewer.id,
          gameId: game.id,
          title: `${titleTemplate} (${reviewIndex + 1}/${reviewCount})`,
          body: `${bodyTemplate} [${gameData.title}]`,
          spoiler: reviewIndex % 7 === 0,
          moderation: "APPROVED",
          createdAt: new Date(Date.now() - (reviewIndex + gameIndex) * 6 * 60 * 60 * 1000),
        },
      });
    }
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
