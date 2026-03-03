import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { findDevUserByEmail } from "@/lib/dev-auth-store";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) {
            return null;
          }

          const normalizedEmail = credentials.email.trim().toLowerCase();
          let user: Awaited<ReturnType<typeof prisma.user.findUnique>> | ReturnType<typeof findDevUserByEmail> = null;

          try {
            user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
          } catch {
            user = null;
          }

          if (!user) {
            const devUser = findDevUserByEmail(normalizedEmail);

            if (devUser) {
              user = devUser;
            }
          }

          if (!user?.passwordHash) {
            return null;
          }

          const validPassword = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!validPassword) {
            return null;
          }

          return {
            id: user.id,
            name: user.name ?? user.username,
            email: user.email,
            image: user.image,
            username: user.username,
            role: user.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username ?? user.name ?? "player";
        token.role = (user.role ?? UserRole.USER) as UserRole;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub ?? "") as string;
        session.user.username = (token.username ?? session.user.name ?? "player") as string;
        session.user.role = ((token.role ?? UserRole.USER) as UserRole) as UserRole;
      }

      return session;
    },
  },
};
