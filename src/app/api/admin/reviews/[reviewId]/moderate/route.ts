import { ReviewStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getCurrentUserRole, isModeratorRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";
import { getClientFingerprint } from "@/lib/request-client";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/rate-limit";

const moderateSchema = z.object({
  status: z.enum([ReviewStatus.APPROVED, ReviewStatus.REJECTED]),
});

type RouteContext = {
  params: Promise<{ reviewId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const role = await getCurrentUserRole();

  if (!session?.user?.id || !isModeratorRole(role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const rateLimit = checkRateLimit({
    key: `review-moderation:${getClientFingerprint(request, session.user.id)}`,
    limit: 60,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ message: "Too many moderation actions." }, { status: 429, headers: withRateLimitHeaders(rateLimit) });
  }

  const { reviewId } = await context.params;

  try {
    const payload = await request.json();
    const parsed = moderateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid moderation action." }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { moderation: parsed.data.status },
      select: { id: true, moderation: true },
    });

    await prisma.moderationLog.create({
      data: {
        reviewId,
        actorUserId: session.user.id,
        action: parsed.data.status,
      },
    });

    return NextResponse.json({ review }, { headers: withRateLimitHeaders(rateLimit) });
  } catch {
    return NextResponse.json({ message: "Moderation action failed." }, { status: 500, headers: withRateLimitHeaders(rateLimit) });
  }
}
