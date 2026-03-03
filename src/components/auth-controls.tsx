"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AuthControls() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-xs text-textMuted">Loading...</span>;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/signin" className="rounded-full border border-white/15 px-4 py-2 text-sm text-text">
          Sign In
        </Link>
        <Link href="/signup" className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white">
          Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {session.user.role === "ADMIN" || session.user.role === "MODERATOR" ? (
        <Link href="/admin/moderation" className="rounded-full border border-white/15 px-4 py-2 text-sm text-accentSoft">
          Admin
        </Link>
      ) : null}
      <Link href="/profile" className="rounded-full border border-white/15 px-4 py-2 text-sm text-text">
        {session.user.username}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-white/15 px-4 py-2 text-sm text-textMuted"
      >
        Sign Out
      </button>
    </div>
  );
}
