import { NextResponse } from "next/server";
import { getCurrentUserRole, isModeratorRole } from "@/lib/role-guard";
import { getAdminAnalytics, normalizeAnalyticsDays } from "@/lib/admin-analytics";

export async function GET(request: Request) {
  const role = await getCurrentUserRole();

  if (!isModeratorRole(role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const days = normalizeAnalyticsDays(url.searchParams.get("days"));

  const analytics = await getAdminAnalytics(days);

  return NextResponse.json({
    days: analytics.days,
    fromDate: analytics.fromDate,
    metrics: analytics.metrics,
    topFlaggedGames: analytics.topFlaggedGames,
    recentLogs: analytics.recentLogs.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      action: item.action,
      actor: item.actor.username,
      game: {
        title: item.review.game.title,
        slug: item.review.game.slug,
      },
      reviewId: item.reviewId,
    })),
  });
}
