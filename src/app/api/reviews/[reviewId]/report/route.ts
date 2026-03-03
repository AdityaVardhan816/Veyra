import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientFingerprint } from "@/lib/request-client";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/rate-limit";

const reportSchema = z.object({
  reason: z.string().min(5).max(240),
});

type RouteContext = {
  params: Promise<{ reviewId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: `review-report:${getClientFingerprint(request, session.user.id)}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ message: "Too many reports submitted." }, { status: 429, headers: withRateLimitHeaders(rateLimit) });
  }

  const { reviewId } = await context.params;

  try {
    const payload = await request.json();
    const parsed = reportSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid report payload." }, { status: 400 });
    }

    const existing = await prisma.report.findFirst({
      where: {
        userId: session.user.id,
        reviewId,
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ message: "You already reported this review." }, { status: 409 });
    }

    await prisma.report.create({
      data: {
        userId: session.user.id,
        reviewId,
        reason: parsed.data.reason,
      },
    });

    return NextResponse.json({ message: "Report submitted." }, { status: 201, headers: withRateLimitHeaders(rateLimit) });
  } catch {
    return NextResponse.json({ message: "Failed to submit report." }, { status: 500, headers: withRateLimitHeaders(rateLimit) });
  }
}
