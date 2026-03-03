"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Game } from "@/types/game";

type HeroBannerProps = {
  games: Game[];
};

export function HeroBanner({ games }: HeroBannerProps) {
  const slides = useMemo(() => games.slice(0, 8), [games]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-panel/95 shadow-[0_20px_60px_rgba(6,10,20,0.55)]">
      <div className="relative h-[440px] w-full overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((game, index) => (
            <article key={`${game.id}-${index}`} className="relative h-full w-full shrink-0 p-8 md:p-14">
              <img
                src={game.bannerUrl}
                alt={game.title}
                loading={index === 0 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(9,10,15,.88)] via-[rgba(9,10,15,.5)] to-[rgba(9,10,15,.18)]" />
              <div className="absolute inset-0 bg-glow" />
              <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end gap-4">
                <p className="text-xs uppercase tracking-[0.28em] text-accentSoft/95">Featured This Week</p>
                <h1 className="text-4xl font-bold leading-tight text-text drop-shadow-[0_3px_16px_rgba(4,6,12,0.45)] md:text-5xl">
                  {game.title}
                </h1>
                <p className="max-w-xl text-base text-textMuted/95">{game.summary}</p>
                <div className="flex gap-3">
                  <Link
                    href={`/game/${game.slug}`}
                    className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accentSoft hover:shadow-[0_8px_20px_rgba(124,92,255,0.35)]"
                  >
                    View Details
                  </Link>
                  <a
                    href={game.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/15 px-5 py-2.5 text-sm text-text transition hover:border-accent/45 hover:bg-black/30"
                  >
                    <Play className="h-4 w-4" />
                    Watch Trailer
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="absolute bottom-5 right-6 z-20 flex gap-2">
          {slides.map((game, index) => (
            <button
              key={`dot-${game.id}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${game.title}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                activeIndex === index ? "scale-110 bg-accent shadow-[0_0_0_3px_rgba(124,92,255,0.22)]" : "bg-white/35 hover:bg-white/55"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
