"use client";

import { useState } from "react";

type ReportReviewButtonProps = {
  reviewId: string;
};

export function ReportReviewButton({ reviewId }: ReportReviewButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reportReview() {
    setBusy(true);
    setMessage(null);

    const response = await fetch(`/api/reviews/${reviewId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Inappropriate or misleading content" }),
    });

    setBusy(false);

    if (!response.ok) {
      setMessage(response.status === 401 ? "Sign in to report." : "Report failed.");
      return;
    }

    setMessage("Reported");
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={reportReview}
        className="rounded-full border border-white/15 px-2 py-1 text-[11px] text-textMuted disabled:opacity-50"
      >
        Report
      </button>
      {message ? <span className="text-[11px] text-textMuted">{message}</span> : null}
    </div>
  );
}
