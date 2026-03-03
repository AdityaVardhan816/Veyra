import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        trailers: { orderBy: { publishedAt: "desc" }, take: 8 },
        dlcs: { orderBy: { releaseDate: "desc" }, take: 8 },
        news: { orderBy: { publishedAt: "desc" }, take: 12 },
      },
    });

    if (!game) {
      return NextResponse.json({ message: "Game not found." }, { status: 404 });
    }

    return NextResponse.json({
      slug: game.slug,
      trailers: game.trailers,
      dlcs: game.dlcs,
      news: game.news,
    });
  } catch {
    return NextResponse.json({ message: "Unable to load game feed." }, { status: 500 });
  }
}
