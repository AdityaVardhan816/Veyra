"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type RatingFormProps = {
  gameSlug: string;
};

export function RatingForm({ gameSlug }: RatingFormProps) {
  const { status } = useSession();
  const [score, setScore] = useState(8);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitRating(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameSlug, score }),
    });

    setSubmitting(false);

    if (!response.ok) {
      setMessage(response.status === 401 ? "Sign in to submit your rating." : "Could not save rating.");
      return;
    }

    setMessage("Rating saved.");
  }

  if (status === "unauthenticated") {
    return <p className="text-sm text-textMuted">Sign in to rate this game.</p>;
  }

  return (
    <form onSubmit={submitRating} className="space-y-3 rounded-2xl border border-white/10 bg-panelSoft p-4">
      <p className="text-sm text-textMuted">Your rating</p>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={10}
          step={0.1}
          value={score}
          onChange={(event) => setScore(Number(event.target.value))}
          className="w-full"
        />
        <span className="w-12 text-right text-sm text-amber-300">{score.toFixed(1)}</span>
      </div>
      <button
        type="submit"
        disabled={submitting || status !== "authenticated"}
        className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save Rating"}
      </button>
      {message ? <p className="text-xs text-textMuted">{message}</p> : null}
    </form>
  );
}
