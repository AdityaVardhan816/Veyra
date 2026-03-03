import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createDevUser, findDevUserByEmailOrUsername } from "@/lib/dev-auth-store";
import { getClientFingerprint } from "@/lib/request-client";
import { checkRateLimit, withRateLimitHeaders } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `register:${getClientFingerprint(request)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many sign up attempts. Please try again later." },
      { status: 429, headers: withRateLimitHeaders(rateLimit) },
    );
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input." }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const username = parsed.data.username.trim();
    const { password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);

    let existingUser: { id: string } | null = null;

    try {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
        select: { id: true },
      });
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }

      const devExisting = findDevUserByEmailOrUsername(email, username);
      if (devExisting) {
        return NextResponse.json({ message: "Email or username already in use." }, { status: 409, headers: withRateLimitHeaders(rateLimit) });
      }

      createDevUser({ email, username, passwordHash });
      return NextResponse.json({ message: "Account created." }, { status: 201, headers: withRateLimitHeaders(rateLimit) });
    }

    if (existingUser) {
      return NextResponse.json({ message: "Email or username already in use." }, { status: 409 });
    }

    await prisma.user.create({
      data: {
        email,
        username,
        name: username,
        passwordHash,
      },
    });

    return NextResponse.json({ message: "Account created." }, { status: 201, headers: withRateLimitHeaders(rateLimit) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Email or username already in use." }, { status: 409, headers: withRateLimitHeaders(rateLimit) });
    }

    return NextResponse.json({ message: "Registration failed." }, { status: 500, headers: withRateLimitHeaders(rateLimit) });
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
