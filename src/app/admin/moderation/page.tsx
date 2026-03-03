import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserRole, isModeratorRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";
import { ModerationActions } from "@/components/moderation-actions";
import { getAdminAnalytics, normalizeAnalyticsDays } from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";

type ModerationPageProps = {
  searchParams: Promise<{ days?: string }>;
};

export default async function ModerationPage({ searchParams }: ModerationPageProps) {
  const role = await getCurrentUserRole();

  if (!isModeratorRole(role)) {
    redirect("/");
  }

  const params = await searchParams;
  const days = normalizeAnalyticsDays(params.days);
  const pendingReviews = await prisma.review.findMany({
    where: {
      OR: [{ moderation: "PENDING" }, { reports: { some: {} } }],
    },
    include: {
      game: { select: { title: true, slug: true } },
      user: { select: { username: true } },
      reports: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const analytics = await getAdminAnalytics(days);
  const quickRanges = [7, 14, 30, 60, 90];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-panel p-6">
        <h1 className="text-2xl font-semibold">Moderation Queue</h1>
        <p className="mt-1 text-sm text-textMuted">Manage pending or reported reviews.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {quickRanges.map((range) => (
            <Link
              key={range}
              href={`/admin/moderation?days=${range}`}
              className={`rounded-full border px-3 py-1 text-xs ${
                days === range ? "border-accentSoft bg-accent/20 text-accentSoft" : "border-white/15 bg-panelSoft text-textMuted"
              }`}
            >
              Last {range}d
            </Link>
          ))}
          <a
            href={`/api/admin/analytics/export?days=${days}`}
            className="ml-auto rounded-full border border-white/15 bg-panelSoft px-3 py-1 text-xs text-text"
          >
            Export CSV
          </a>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-panel p-4">
          <p className="text-xs uppercase tracking-wider text-textMuted">Pending Reviews</p>
          <p className="mt-2 text-2xl font-semibold">{analytics.metrics.pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-panel p-4">
          <p className="text-xs uppercase tracking-wider text-textMuted">Reported Reviews</p>
          <p className="mt-2 text-2xl font-semibold">{analytics.metrics.reportedCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-panel p-4">
          <p className="text-xs uppercase tracking-wider text-textMuted">Approved ({days}d)</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">{analytics.metrics.approvedCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-panel p-4">
          <p className="text-xs uppercase tracking-wider text-textMuted">Rejected ({days}d)</p>
          <p className="mt-2 text-2xl font-semibold text-rose-300">{analytics.metrics.rejectedCount}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-panel p-4">
          <h2 className="text-base font-semibold">Top Flagged Games</h2>
          <div className="mt-3 space-y-2">
            {analytics.topFlaggedGames.length === 0 ? (
              <p className="text-sm text-textMuted">No reported games yet.</p>
            ) : (
              analytics.topFlaggedGames.map((item) => (
                <div key={item.slug} className="flex items-center justify-between rounded-xl border border-white/10 bg-panelSoft p-3">
                  <span className="text-sm">{item.title}</span>
                  <span className="text-xs text-textMuted">{item.reports} report(s)</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-panel p-4">
          <h2 className="text-base font-semibold">Recent Moderator Actions</h2>
          <div className="mt-3 space-y-2">
            {analytics.recentLogs.length === 0 ? (
              <p className="text-sm text-textMuted">No moderation actions in the last {days} days.</p>
            ) : (
              analytics.recentLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="rounded-xl border border-white/10 bg-panelSoft p-3">
                  <p className="text-sm">
                    <span className="font-medium">{log.actor.username}</span> {log.action.toLowerCase()} a review on {log.review.game.title}
                  </p>
                  <p className="mt-1 text-xs text-textMuted">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="space-y-3">
        {pendingReviews.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-panel p-6 text-sm text-textMuted">No pending moderation items.</div>
        ) : (
          pendingReviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-white/10 bg-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{review.title}</p>
                  <p className="text-xs text-textMuted">
                    {review.game.title} • by {review.user.username}
                  </p>
                </div>
                <ModerationActions reviewId={review.id} initialStatus={review.moderation} />
              </div>
              <p className="mt-3 text-sm text-textMuted">{review.body}</p>
              <p className="mt-2 text-xs text-textMuted">Reports: {review.reports.length}</p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
