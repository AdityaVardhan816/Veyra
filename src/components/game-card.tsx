import Link from "next/link";
import { Star } from "lucide-react";
import { Game } from "@/types/game";

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  const cardImage = game.bannerUrl || game.coverUrl;

  return (
    <Link
      href={`/game/${game.slug}`}
      className="group h-[268px] w-[228px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-panel/95 shadow-premium transition duration-300 hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-[0_20px_45px_rgba(10,14,28,0.55)]"
    >
      <div className="relative h-36 w-full overflow-hidden bg-panelSoft">
        {cardImage ? (
          <img
            src={cardImage}
            alt={game.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-textMuted">No image</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-70" />
      </div>
      <div className="space-y-2.5 p-4">
        <p className="line-clamp-1 text-[15px] font-semibold text-text">{game.title}</p>
        <p className="line-clamp-1 text-xs text-textMuted/95">{game.genres.join(" • ")}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-textMuted/95">
          <span className="line-clamp-1 min-w-0">{game.platforms.join(" / ")}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/10 px-2 py-0.5 text-amber-300">
            <Star className="h-3.5 w-3.5 fill-current" />
            {game.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
