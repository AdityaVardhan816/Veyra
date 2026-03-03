import { prisma } from "@/lib/prisma";

export function normalizeAnalyticsDays(value?: string | null) {
  const parsed = Number(value ?? "7");

  if (!Number.isFinite(parsed)) {
    return 7;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), 90);
}

export async function getAdminAnalytics(days: number) {
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [pendingCount, reportedCount, recentLogs, topReportedReviews] = await Promise.all([
    prisma.review.count({ where: { moderation: "PENDING" } }),
    prisma.review.count({ where: { reports: { some: {} } } }),
    prisma.moderationLog.findMany({
      where: { createdAt: { gte: fromDate } },
      include: {
        actor: { select: { username: true } },
        review: { include: { game: { select: { title: true, slug: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.review.findMany({
      where: { reports: { some: { createdAt: { gte: fromDate } } } },
      include: {
        game: { select: { title: true, slug: true } },
        reports: {
          where: { createdAt: { gte: fromDate } },
          select: { createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const approvedCount = recentLogs.filter((item) => item.action === "APPROVED").length;
  const rejectedCount = recentLogs.filter((item) => item.action === "REJECTED").length;

  const topFlaggedGames = Array.from(
    topReportedReviews
      .reduce<Map<string, { slug: string; title: string; reports: number }>>((map, review) => {
        const current = map.get(review.game.slug) ?? { slug: review.game.slug, title: review.game.title, reports: 0 };
        current.reports += review.reports.length;
        map.set(review.game.slug, current);
        return map;
      }, new Map())
      .values(),
  )
    .sort((left, right) => right.reports - left.reports)
    .slice(0, 10);

  return {
    days,
    fromDate,
    metrics: {
      pendingCount,
      reportedCount,
      approvedCount,
      rejectedCount,
    },
    topFlaggedGames,
    recentLogs,
  };
}

export function buildAnalyticsCsv(analytics: Awaited<ReturnType<typeof getAdminAnalytics>>) {
  const header = "section,date,actor,action,game,reports,details";

  const metricRows = [
    `metrics,${new Date().toISOString()},,pending,,${analytics.metrics.pendingCount},pending reviews`,
    `metrics,${new Date().toISOString()},,reported,,${analytics.metrics.reportedCount},reported reviews`,
    `metrics,${new Date().toISOString()},,approved,,${analytics.metrics.approvedCount},approved in range`,
    `metrics,${new Date().toISOString()},,rejected,,${analytics.metrics.rejectedCount},rejected in range`,
  ];

  const flaggedRows = analytics.topFlaggedGames.map(
    (item) => `top_flagged,${new Date().toISOString()},,report_count,${escapeCsv(item.title)},${item.reports},${item.slug}`,
  );

  const actionRows = analytics.recentLogs.map(
    (item) =>
      `moderation_action,${item.createdAt.toISOString()},${escapeCsv(item.actor.username ?? "unknown")},${item.action},${escapeCsv(
        item.review.game.title,
      )},,review:${item.reviewId}`,
  );

  return [header, ...metricRows, ...flaggedRows, ...actionRows].join("\n");
}

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}
