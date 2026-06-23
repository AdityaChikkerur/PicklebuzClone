import type { GameScore } from "@/types/match";
import { cn } from "@/lib/utils";

interface GameScoreChipsProps {
  gameScores: GameScore[];
  teamAName: string;
  teamBName: string;
  className?: string;
}

export function GameScoreChips({
  gameScores,
  teamAName,
  teamBName,
  className,
}: GameScoreChipsProps) {
  if (gameScores.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No completed games yet.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {gameScores.map((game) => (
        <div
          key={game.gameNumber}
          className={cn(
            "rounded-xl border px-3 py-2 text-sm font-semibold",
            game.winner === "A"
              ? "border-primary/30 bg-primary/10 text-primary"
              : game.winner === "B"
                ? "border-secondary/30 bg-secondary/10 text-secondary"
                : "border-border bg-muted text-muted-foreground"
          )}
        >
          <span className="text-xs font-normal text-muted-foreground">
            G{game.gameNumber}
          </span>{" "}
          {game.scoreA}-{game.scoreB}
          {game.winner && (
            <span className="ml-1 text-xs font-normal">
              ({game.winner === "A" ? teamAName : teamBName})
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
