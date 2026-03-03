import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientFingerprint } from "@/lib/request-client";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/rate-limit";

const ratingSchema = z.object({
  gameSlug: z.string().min(1),
  score: z.number().min(1).max(10),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: `ratings:${getClientFingerprint(request, session.user.id)}`,
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ message: "Too many rating attempts." }, { status: 429, headers: withRateLimitHeaders(rateLimit) });
  }

  try {
    const body = await request.json();
    const parsed = ratingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { slug: parsed.data.gameSlug },
      select: { id: true },
    });

    if (!game) {
      return NextResponse.json({ message: "Game not found." }, { status: 404 });
    }

    const rating = await prisma.rating.upsert({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId: game.id,
        },
      },
      update: { score: parsed.data.score },
      create: {
        userId: session.user.id,
        gameId: game.id,
        score: parsed.data.score,
      },
    });

    return NextResponse.json({ rating }, { headers: withRateLimitHeaders(rateLimit) });
  } catch {
    return NextResponse.json({ message: "Failed to submit rating." }, { status: 500, headers: withRateLimitHeaders(rateLimit) });
  }
}
