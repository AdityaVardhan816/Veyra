"use client";

import { useState } from "react";

type ModerationActionsProps = {
  reviewId: string;
  initialStatus: "PENDING" | "APPROVED" | "REJECTED";
};

export function ModerationActions({ reviewId, initialStatus }: ModerationActionsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function updateStatus(nextStatus: "APPROVED" | "REJECTED") {
    setBusy(true);
    setMessage(null);

    const response = await fetch(`/api/admin/reviews/${reviewId}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    setBusy(false);

    if (!response.ok) {
      setMessage("Action failed.");
      return;
    }

    setStatus(nextStatus);
    setMessage(`Review ${nextStatus.toLowerCase()}.`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-white/15 bg-panelSoft px-2 py-1 text-xs text-textMuted">{status}</span>
      <button
        type="button"
        disabled={busy}
        onClick={() => updateStatus("APPROVED")}
        className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => updateStatus("REJECTED")}
        className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-200 disabled:opacity-50"
      >
        Reject
      </button>
      {message ? <span className="text-xs text-textMuted">{message}</span> : null}
    </div>
  );
}
