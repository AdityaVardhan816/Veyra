import { NextResponse } from "next/server";
import { buildAnalyticsCsv, getAdminAnalytics, normalizeAnalyticsDays } from "@/lib/admin-analytics";
import { getCurrentUserRole, isModeratorRole } from "@/lib/role-guard";

export async function GET(request: Request) {
  const role = await getCurrentUserRole();

  if (!isModeratorRole(role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const days = normalizeAnalyticsDays(url.searchParams.get("days"));
  const analytics = await getAdminAnalytics(days);
  const csv = buildAnalyticsCsv(analytics);
  const filename = `moderation-analytics-${days}d.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  });
}
