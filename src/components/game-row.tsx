import { Game } from "@/types/game";
import { GameCard } from "@/components/game-card";

type GameRowProps = {
  title: string;
  games: Game[];
};

export function GameRow({ title, games }: GameRowProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-text">{title}</h2>
        <span className="text-xs uppercase tracking-[0.16em] text-textMuted/80">{games.length} games</span>
      </div>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-panel/70 via-panel/20 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-panel/70 via-panel/20 to-transparent" />
      </div>
    </section>
  );
}
