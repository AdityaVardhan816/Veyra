"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { ReportReviewButton } from "@/components/report-review-button";

type ReviewItem = {
  id: string;
  title: string;
  body: string;
  user: { username: string };
  stars: number;
  reportable: boolean;
};

type LatestReviewsProps = {
  gameSlug: string;
  initialReviews: ReviewItem[];
};

const eventName = "veyra:review-submitted";

export function LatestReviews({ gameSlug, initialReviews }: LatestReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const storageKey = useMemo(() => `temp-reviews:${gameSlug}`, [gameSlug]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as ReviewItem[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return;
      }

      setReviews((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        const merged = [...parsed.filter((item) => !existingIds.has(item.id)), ...current];
        return merged;
      });
    } catch {
      // ignore malformed session storage in local mode
    }
  }, [storageKey]);

  useEffect(() => {
    function onReviewSubmitted(event: Event) {
      const customEvent = event as CustomEvent<{ gameSlug: string; review: ReviewItem }>;
      if (!customEvent.detail || customEvent.detail.gameSlug !== gameSlug) {
        return;
      }

      setReviews((current) => [customEvent.detail.review, ...current]);
    }

    window.addEventListener(eventName, onReviewSubmitted as EventListener);
    return () => window.removeEventListener(eventName, onReviewSubmitted as EventListener);
  }, [gameSlug]);

  return (
    <div className="rounded-2xl border border-white/10 bg-panelSoft p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wider text-textMuted">Latest Reviews</p>
        <span className="rounded-full border border-white/15 bg-panel px-2.5 py-1 text-[11px] text-textMuted">{reviews.length} shown</span>
      </div>
      {reviews.length === 0 ? (
        <p className="text-sm text-textMuted">No approved reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-white/10 bg-panel/95 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-medium text-accentSoft">
                      {review.user.username.charAt(0).toUpperCase()}
                    </span>
                    <p className="truncate text-sm font-semibold text-text">{review.title}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-2 pl-9 text-xs text-textMuted">
                    <span>by {review.user.username}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-amber-200">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {review.stars.toFixed(1)} / 5
                    </span>
                  </div>
                </div>
                {review.reportable ? <ReportReviewButton reviewId={review.id} /> : null}
              </div>
              <p className="mt-3 break-words text-sm leading-6 text-textMuted">{review.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
