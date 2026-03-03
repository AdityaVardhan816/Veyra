import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listDevReviewsByUserId } from "@/lib/dev-review-store";
import { listDevWatchlistByUserId } from "@/lib/dev-watchlist-store";
import { games as mockGames } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/profile");
  }

  let user = null as Awaited<ReturnType<typeof prisma.user.findUnique>> | null;

  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        ratings: {
          include: { game: { select: { title: true, slug: true } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        reviews: {
          include: { game: { select: { title: true, slug: true } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        watchlist: true,
      },
    });
  } catch {
    user = null;
  }

  const fallbackReviews = listDevReviewsByUserId(session.user.id);
  const fallbackWatchlist = listDevWatchlistByUserId(session.user.id);
  const gameTitleBySlug = new Map(mockGames.map((game) => [game.slug, game.title]));

  const profile =
    user ??
    {
      username: session.user.username,
      email: session.user.email ?? "",
      ratings: fallbackReviews.slice(0, 5).map((review) => ({
        id: review.id,
        score: Number((review.stars * 2).toFixed(1)),
        game: {
          title: gameTitleBySlug.get(review.gameSlug) ?? review.gameSlug,
          slug: review.gameSlug,
        },
      })),
      reviews: fallbackReviews.slice(0, 5).map((review) => ({
        id: review.id,
        title: review.title,
        createdAt: review.createdAt,
        game: {
          title: gameTitleBySlug.get(review.gameSlug) ?? review.gameSlug,
          slug: review.gameSlug,
        },
      })),
      watchlist: fallbackWatchlist.map((entry) => ({
        id: entry.id,
      })),
    };

  const averageRating =
    profile.ratings.length > 0
      ? profile.ratings.reduce((accumulator, rating) => accumulator + rating.score, 0) / profile.ratings.length
      : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-panel p-6">
        <h1 className="text-2xl font-semibold">{profile.username}</h1>
        <p className="mt-1 text-sm text-textMuted">{profile.email}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-panelSoft p-4">
            <p className="text-xs uppercase tracking-wider text-textMuted">Ratings</p>
            <p className="mt-1 text-2xl font-semibold">{profile.ratings.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-panelSoft p-4">
            <p className="text-xs uppercase tracking-wider text-textMuted">Average Score</p>
            <p className="mt-1 text-2xl font-semibold">{averageRating.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-panelSoft p-4">
            <p className="text-xs uppercase tracking-wider text-textMuted">Watchlist</p>
            <p className="mt-1 text-2xl font-semibold">{profile.watchlist.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-panel p-6">
        <h2 className="text-lg font-semibold">Recent Ratings</h2>
        <div className="mt-4 space-y-3">
          {profile.ratings.length === 0 ? (
            <p className="text-sm text-textMuted">No ratings yet.</p>
          ) : (
            profile.ratings.map((rating) => (
              <div key={rating.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-panelSoft p-3">
                <Link href={`/game/${rating.game.slug}`} className="text-sm hover:text-accentSoft">
                  {rating.game.title}
                </Link>
                <span className="text-sm text-amber-300">{rating.score.toFixed(1)} / 10</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-panel p-6">
        <h2 className="text-lg font-semibold">Recent Reviews</h2>
        <div className="mt-4 space-y-3">
          {profile.reviews.length === 0 ? (
            <p className="text-sm text-textMuted">No reviews yet.</p>
          ) : (
            profile.reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-white/10 bg-panelSoft p-3">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/game/${review.game.slug}`} className="text-sm hover:text-accentSoft">
                    {review.game.title}
                  </Link>
                  <span className="text-xs text-textMuted">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm text-text">{review.title}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
