import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDevReview } from "@/lib/dev-review-store";
import { addDevWatchlistEntry } from "@/lib/dev-watchlist-store";
import { getClientFingerprint } from "@/lib/request-client";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/rate-limit";

const reviewSchema = z.object({
  gameSlug: z.string().min(1),
  title: z.string().min(3).max(120),
  body: z.string().min(20).max(2000),
  spoiler: z.boolean().default(false),
  stars: z.number().min(1).max(5).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: `reviews:${getClientFingerprint(request, session.user.id)}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ message: "Too many review submissions." }, { status: 429, headers: withRateLimitHeaders(rateLimit) });
  }

  try {
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
    }

    let review: unknown;

    try {
      const game = await prisma.game.findUnique({ where: { slug: parsed.data.gameSlug }, select: { id: true } });

      if (!game) {
        return NextResponse.json({ message: "Game not found." }, { status: 404 });
      }

      review = await prisma.review.create({
        data: {
          userId: session.user.id,
          gameId: game.id,
          title: parsed.data.title,
          body: parsed.data.body,
          spoiler: parsed.data.spoiler,
          moderation: "PENDING",
        },
      });
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }

      review = createDevReview({
        gameSlug: parsed.data.gameSlug,
        userId: session.user.id,
        username: session.user.username ?? "Player",
        title: parsed.data.title,
        body: parsed.data.body,
        spoiler: parsed.data.spoiler,
        stars: parsed.data.stars,
      });

      addDevWatchlistEntry({
        userId: session.user.id,
        gameSlug: parsed.data.gameSlug,
      });
    }

    return NextResponse.json({ review }, { status: 201, headers: withRateLimitHeaders(rateLimit) });
  } catch {
    return NextResponse.json({ message: "Failed to submit review." }, { status: 500, headers: withRateLimitHeaders(rateLimit) });
  }
}

function isDatabaseUnavailableError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1001") {
    return true;
  }

  if (error instanceof Error && /Can't reach database server/i.test(error.message)) {
    return true;
  }

  return false;
}
