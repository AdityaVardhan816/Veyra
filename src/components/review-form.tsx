"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type ReviewFormProps = {
  gameSlug: string;
};

export function ReviewForm({ gameSlug }: ReviewFormProps) {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [stars, setStars] = useState(4.0);
  const [spoiler, setSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameSlug, title, body, spoiler, stars }),
    });

    setSubmitting(false);

    if (!response.ok) {
      setMessage(response.status === 401 ? "Sign in to post a review." : "Could not submit review.");
      return;
    }

    const submittedReview = {
      id: `temp-review-${Date.now()}`,
      title,
      body,
      user: { username: session?.user?.username ?? "You" },
      stars,
      reportable: false,
    };

    if (typeof window !== "undefined") {
      const storageKey = `temp-reviews:${gameSlug}`;

      try {
        const existing = sessionStorage.getItem(storageKey);
        const parsed = existing ? (JSON.parse(existing) as typeof submittedReview[]) : [];
        sessionStorage.setItem(storageKey, JSON.stringify([submittedReview, ...parsed]));
      } catch {
        // ignore session storage write failures
      }

      window.dispatchEvent(new CustomEvent("veyra:review-submitted", { detail: { gameSlug, review: submittedReview } }));
    }

    setTitle("");
    setBody("");
    setStars(4.0);
    setSpoiler(false);
    setMessage("Review submitted.");
  }

  if (status === "unauthenticated") {
    return <p className="text-sm text-textMuted">Sign in to write a review.</p>;
  }

  return (
    <form onSubmit={submitReview} className="space-y-3 rounded-2xl border border-white/10 bg-panelSoft p-4">
      <p className="text-sm text-textMuted">Write a review</p>
      <input
        type="text"
        placeholder="Review title"
        minLength={3}
        maxLength={120}
        required
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="w-full rounded-xl border border-white/15 bg-panel px-3 py-2 text-sm text-text outline-none ring-accent/40 focus:ring"
      />
      <textarea
        placeholder="Share your thoughts..."
        minLength={20}
        maxLength={2000}
        required
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={4}
        className="w-full rounded-xl border border-white/15 bg-panel px-3 py-2 text-sm text-text outline-none ring-accent/40 focus:ring"
      />
      <div>
        <p className="mb-1 text-sm text-textMuted">Your review rating</p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={stars}
            onChange={(event) => setStars(Number(event.target.value))}
            className="w-full"
          />
          <span className="w-16 text-right text-sm text-amber-300">{stars.toFixed(1)} / 5</span>
        </div>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-textMuted">
        <input type="checkbox" checked={spoiler} onChange={(event) => setSpoiler(event.target.checked)} />
        Contains spoiler
      </label>
      <div>
        <button
          type="submit"
          disabled={submitting || status !== "authenticated"}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Posting..." : "Post Review"}
        </button>
      </div>
      {message ? <p className="text-xs text-textMuted">{message}</p> : null}
    </form>
  );
}
