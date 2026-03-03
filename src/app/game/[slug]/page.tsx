import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Film, Puzzle } from "lucide-react";
import { games } from "@/lib/mock-data";
import { getCatalogGames } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { RatingForm } from "@/components/rating-form";
import { ReviewForm } from "@/components/review-form";
import { ReportReviewButton } from "@/components/report-review-button";
import { LatestReviews } from "@/components/latest-reviews";

export const revalidate = 120;

type GameDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

const fallbackTrailerPool = [
  "https://www.youtube.com/watch?v=AKXiKBnzpBQ",
  "https://www.youtube.com/watch?v=UnA7tepsc7s",
  "https://www.youtube.com/watch?v=hfJ4Km46A-0",
  "https://www.youtube.com/watch?v=1T22wNvoNiU",
  "https://www.youtube.com/watch?v=Cr5rQ1NZ0Tw",
  "https://www.youtube.com/watch?v=sJbexcm4Trk",
];

const reviewTitleTemplates = [
  "Excellent gameplay loop",
  "Great progression and pacing",
  "Strong replay value",
  "Impressive world design",
  "Great with friends",
  "Polished and immersive",
  "Very fun overall",
  "A few flaws, still worth it",
  "Surprisingly addictive",
  "Highly recommend",
];

const reviewBodyTemplates = [
  "Combat and progression feel rewarding, and the content cadence keeps each session fresh.",
  "Presentation is strong, controls are responsive, and there is enough variety to stay engaging for hours.",
  "The core systems are easy to learn but still deep enough to reward mastery over time.",
  "Exploration and encounter design stand out, with memorable moments throughout.",
  "Co-op flow and match pacing are excellent, and onboarding is straightforward for new players.",
  "This game has a clear identity and executes its strengths consistently.",
  "Performance is stable overall and the moment-to-moment gameplay feels polished.",
  "The game has a few rough edges, but the positives easily outweigh the negatives.",
  "Build diversity and progression choices add great replayability.",
  "A strong package with plenty of content and good long-term value.",
];

const reviewNameFirstPool = [
  "Alex",
  "Jordan",
  "Riley",
  "Sam",
  "Taylor",
  "Casey",
  "Avery",
  "Morgan",
  "Drew",
  "Cameron",
  "Quinn",
  "Mason",
  "Noah",
  "Liam",
  "Ethan",
  "Logan",
  "Lucas",
  "Owen",
  "Harper",
  "Chloe",
  "Mia",
  "Emily",
  "Grace",
  "Luna",
  "Zoe",
  "Aria",
  "Nora",
  "Leah",
  "Sofia",
  "Hazel",
];

const reviewNameLastPool = [
  "Stone",
  "Parker",
  "Reed",
  "Hayes",
  "Bennett",
  "Cole",
  "Turner",
  "Fisher",
  "Brooks",
  "Gray",
  "Frost",
  "Knight",
  "Shaw",
  "Blake",
  "Mills",
  "Cruz",
  "Wells",
  "Fox",
  "Lane",
  "Hart",
  "Vega",
  "Rivers",
  "Wright",
  "Flynn",
  "Nash",
  "Bishop",
  "Cross",
  "Scott",
  "West",
  "Moore",
];

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

function buildFallbackTrailers(title: string, slug: string, seed: number) {
  const trailerCount = 4 + (seed % 3);
  const trailerKinds = ["Official Trailer", "Gameplay Trailer", "Launch Trailer", "Overview Trailer", "Deep Dive Trailer", "Accolades Trailer"];

  return Array.from({ length: trailerCount }, (_, index) => ({
    id: `fallback-trailer-${slug}-${index + 1}`,
    title: `${title} ${trailerKinds[index % trailerKinds.length]}`,
    videoUrl: fallbackTrailerPool[(seed + index) % fallbackTrailerPool.length],
  }));
}

function buildFallbackDlcs(title: string, slug: string, seed: number) {
  const dlcCount = 2 + (seed % 3);
  const dlcTypes = ["Expansion", "Story Pack", "Season Update", "Content Bundle", "Challenge Pack"];

  return Array.from({ length: dlcCount }, (_, index) => ({
    id: `fallback-dlc-${slug}-${index + 1}`,
    title: `${title} ${dlcTypes[(seed + index) % dlcTypes.length]} ${index + 1}`,
    releaseDate: new Date(Date.now() - (index + 1) * 90 * 24 * 60 * 60 * 1000),
  }));
}

function buildFallbackNews(title: string, slug: string, seed: number) {
  const sources = ["Reddit", "IGN", "GameSpot", "Eurogamer", "PC Gamer", "Rock Paper Shotgun"];

  return Array.from({ length: 6 }, (_, index) => {
    const isLeak = index >= 4;
    return {
      id: `fallback-news-${slug}-${index + 1}`,
      title: isLeak ? `${title} rumor tracker #${index - 3}` : `${title} news roundup #${index + 1}`,
      sourceName: sources[(seed + index) % sources.length],
      body: isLeak
        ? `Unconfirmed reports and community speculation around ${title} from forum and social discussions.`
        : `Coverage collected from major gaming sites for ${title}, including updates, patch notes, and community highlights.`,
      isLeak,
    };
  });
}

function buildFallbackReviews(title: string, slug: string, seed: number) {
  const reviewCount = 8 + (seed % 13);

  return Array.from({ length: reviewCount }, (_, index) => ({
    id: `fallback-review-${slug}-${index + 1}`,
    title: reviewTitleTemplates[(seed + index) % reviewTitleTemplates.length],
    body: reviewBodyTemplates[(seed + index * 3) % reviewBodyTemplates.length],
    user: {
      username: `${reviewNameFirstPool[(seed + index * 5) % reviewNameFirstPool.length]} ${reviewNameLastPool[(seed + index * 7) % reviewNameLastPool.length]}`,
    },
    stars: getReviewStarRating(`${slug}:${index}:fallback`),
    reportable: false,
  }));
}

async function getDbGame(slug: string) {
  return prisma.game.findUnique({
    where: { slug },
    include: {
      trailers: {
        orderBy: { publishedAt: "desc" },
        take: 6,
      },
      dlcs: true,
      news: {
        orderBy: { publishedAt: "desc" },
        take: 5,
      },
      ratings: {
        select: { score: true },
      },
      reviews: {
        where: { moderation: "APPROVED" },
        include: {
          user: {
            select: { username: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      genres: {
        include: { genre: true },
      },
      platforms: {
        include: { platform: true },
      },
    },
  });
}

export default async function GameDetailsPage({ params }: GameDetailsPageProps) {
  const { slug } = await params;
  const allGames = await getCatalogGames();

  let dbGame: Awaited<ReturnType<typeof getDbGame>> = null;

  try {
    dbGame = await getDbGame(slug);
  } catch {
    dbGame = null;
  }

  const mockGame = games.find((entry) => entry.slug === slug);
  const catalogGame = allGames.find((entry) => entry.slug === slug);

  if (!dbGame && !mockGame && !catalogGame) {
    notFound();
  }

  const ratingAverage =
    dbGame && dbGame.ratings.length > 0
      ? dbGame.ratings.reduce((accumulator, rating) => accumulator + rating.score, 0) / dbGame.ratings.length
      : null;

  const seed = hashSeed(slug);
  const fallbackTitle = catalogGame?.title ?? mockGame?.title ?? "Unknown Game";
  const fallbackSummary = catalogGame?.summary ?? mockGame?.summary ?? `${fallbackTitle} details are being compiled.`;
  const fallbackBanner = catalogGame?.bannerUrl ?? mockGame?.bannerUrl ?? catalogGame?.coverUrl ?? mockGame?.coverUrl ?? `/api/game-image?type=banner&title=${encodeURIComponent(fallbackTitle)}`;
  const fallbackCover = catalogGame?.coverUrl ?? mockGame?.coverUrl ?? fallbackBanner;
  const fallbackTrailers = buildFallbackTrailers(fallbackTitle, slug, seed);
  const fallbackDlcs = buildFallbackDlcs(fallbackTitle, slug, seed);
  const fallbackNews = buildFallbackNews(fallbackTitle, slug, seed);
  const fallbackReviews = buildFallbackReviews(fallbackTitle, slug, seed);

  const game = {
    title: dbGame?.title ?? fallbackTitle,
    summary: dbGame?.summary ?? fallbackSummary,
    coverUrl: dbGame?.coverUrl ?? fallbackCover,
    bannerUrl: dbGame?.bannerUrl ?? fallbackBanner,
    genres: dbGame ? dbGame.genres.map((entry) => entry.genre.name) : (catalogGame?.genres ?? mockGame?.genres ?? ["Action"]),
    platforms: dbGame ? dbGame.platforms.map((entry) => entry.platform.name) : (catalogGame?.platforms ?? mockGame?.platforms ?? ["PC"]),
    rating: ratingAverage ?? catalogGame?.rating ?? mockGame?.rating ?? 8.0,
    ratingsCount: dbGame?.ratings.length ?? catalogGame?.ratingsCount ?? mockGame?.ratingsCount ?? 1800,
    trailerUrl: dbGame?.trailers[0]?.videoUrl ?? fallbackTrailers[0].videoUrl,
    trailers: dbGame?.trailers ?? fallbackTrailers,
    news: dbGame?.news ?? fallbackNews,
    dlcCount: dbGame?.dlcs.length ?? fallbackDlcs.length,
    dlcs: dbGame?.dlcs ?? fallbackDlcs,
    reviews: dbGame
      ? dbGame.reviews.map((review) => ({
          id: review.id,
          title: review.title,
          body: review.body,
          user: review.user,
          stars: getReviewStarRating(`${slug}:${review.id}:${review.user.username}`),
          reportable: true,
        }))
      : fallbackReviews,
  };

  return (
    <div className="space-y-8">
      <Link href="/" className="text-sm text-textMuted hover:text-text">
        ← Back to Home
      </Link>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-panel shadow-premium">
        <div className="relative h-64">
          <img src={game.bannerUrl} alt={game.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(9,10,15,.7)] to-[rgba(9,10,15,.2)]" />
        </div>
        <div className="space-y-5 p-6">
          <div className="flex items-start">
            <h1 className="text-3xl font-bold">{game.title}</h1>
          </div>
          <p className="text-textMuted">{game.summary}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/15 bg-panelSoft px-3 py-1">{game.genres.join(" • ")}</span>
            <span className="rounded-full border border-white/15 bg-panelSoft px-3 py-1">{game.platforms.join(" • ")}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-panelSoft p-4">
              <p className="mb-1 text-xs uppercase tracking-wider text-textMuted">Community Rating</p>
              <p className="inline-flex items-center gap-2 text-2xl font-semibold text-amber-300">
                <Star className="h-6 w-6 fill-current" />
                {game.rating.toFixed(1)}
              </p>
              <p className="text-sm text-textMuted">{game.ratingsCount.toLocaleString()} ratings</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-panelSoft p-4">
              <p className="mb-1 text-xs uppercase tracking-wider text-textMuted">Trailers</p>
              <a href={game.trailerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-accentSoft">
                <Film className="h-5 w-5" />
                Watch Latest Trailer
              </a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-panelSoft p-4">
              <p className="mb-1 text-xs uppercase tracking-wider text-textMuted">DLCs</p>
              <p className="inline-flex items-center gap-2 text-lg">
                <Puzzle className="h-5 w-5" />
                {game.dlcCount} listed
              </p>
            </div>
          </div>

          <RatingForm gameSlug={slug} />
          <ReviewForm gameSlug={slug} />

          <div className="rounded-2xl border border-white/10 bg-panelSoft p-4">
            <p className="mb-3 text-xs uppercase tracking-wider text-textMuted">Trailers Feed</p>
            {game.trailers.length === 0 ? (
              <p className="text-sm text-textMuted">No additional trailers yet.</p>
            ) : (
              <div className="space-y-2">
                {game.trailers.map((trailer) => (
                  <a
                    key={trailer.id}
                    href={trailer.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-white/10 bg-panel p-3 text-sm hover:border-accent/60"
                  >
                    {trailer.title}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-panelSoft p-4">
            <p className="mb-3 text-xs uppercase tracking-wider text-textMuted">DLC Feed</p>
            {game.dlcs.length === 0 ? (
              <p className="text-sm text-textMuted">No DLCs listed yet.</p>
            ) : (
              <div className="space-y-2">
                {game.dlcs.map((dlc) => (
                  <div key={dlc.id} className="rounded-xl border border-white/10 bg-panel p-3">
                    <p className="text-sm font-medium">{dlc.title}</p>
                    <p className="mt-1 text-xs text-textMuted">
                      {dlc.releaseDate ? new Date(dlc.releaseDate).toLocaleDateString() : "Release date TBA"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-panelSoft p-4">
            <p className="mb-3 text-xs uppercase tracking-wider text-textMuted">News & Leaks</p>
            {game.news.length === 0 ? (
              <p className="text-sm text-textMuted">No news items yet.</p>
            ) : (
              <div className="space-y-2">
                {game.news.map((item) => (
                  <article key={item.id} className="rounded-xl border border-white/10 bg-panel p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.isLeak ? (
                        <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-[11px] text-amber-200">
                          LEAK
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-textMuted">{item.sourceName}</p>
                    <p className="mt-2 text-sm text-textMuted">{item.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <LatestReviews gameSlug={slug} initialReviews={game.reviews} />
        </div>
      </section>
    </div>
  );
}
