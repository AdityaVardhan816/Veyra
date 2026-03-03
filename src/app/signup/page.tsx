"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setError(data.message ?? "Unable to create account.");
      return;
    }

    router.push("/signin");
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-panel p-6 shadow-premium">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-textMuted">Join Veyra and start rating your favorite games.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm text-textMuted" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-white/15 bg-panelSoft px-3 py-2 text-sm text-text outline-none ring-accent/40 focus:ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-textMuted" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            minLength={3}
            maxLength={24}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-xl border border-white/15 bg-panelSoft px-3 py-2 text-sm text-text outline-none ring-accent/40 focus:ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-textMuted" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-panelSoft px-3 py-2 pr-16 text-sm text-text outline-none ring-accent/40 focus:ring"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-textMuted hover:text-text"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-textMuted">
        Already have an account? <Link href="/signin" className="text-accentSoft">Sign in</Link>
      </p>
    </div>
  );
}
