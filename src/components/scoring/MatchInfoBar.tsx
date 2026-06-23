import { cn, gamesToWin } from "@/lib/utils";
import type { GameScore, MatchState, Team } from "@/types/match";

function countGameWins(gameScores: GameScore[], team: Team): number {
  return gameScores.filter((g) => g.winner === team).length;
}

interface MatchInfoBarProps {
  matchState: MatchState;
}

export function MatchInfoBar({ matchState }: MatchInfoBarProps) {
  const { gameScores, bestOf, teamAName, teamBName, currentGame } = matchState;
  const gamesNeeded = gamesToWin(bestOf);
  const winsA = countGameWins(gameScores, "A");
  const winsB = countGameWins(gameScores, "B");

  return (
    <div className="border-b border-slate-700/80 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="truncate font-semibold text-slate-200">{teamAName}</span>
        <span className="shrink-0 px-2 font-bold text-slate-400">
          {winsA} – {winsB}
        </span>
        <span className="truncate text-right font-semibold text-slate-200">
          {teamBName}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap justify-center gap-1.5">
        {gameScores.map((game) => (
          <span
            key={game.gameNumber}
            className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300"
          >
            G{game.gameNumber}: {game.scoreA}–{game.scoreB}
          </span>
        ))}
        {!matchState.isMatchComplete && (
          <span className="rounded-lg border border-primary/50 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            G{currentGame}: {matchState.scoreA}–{matchState.scoreB}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: bestOf }).map((_, i) => {
          const gameNum = i + 1;
          const completed = gameScores.find((g) => g.gameNumber === gameNum);
          const isCurrent = !completed && gameNum === currentGame;

          return (
            <div key={gameNum} className="flex flex-col items-center gap-1">
              <div className="flex gap-0.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    completed?.winner === "A"
                      ? "bg-primary"
                      : isCurrent
                        ? "bg-primary/40 ring-1 ring-primary"
                        : "bg-slate-700"
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    completed?.winner === "B"
                      ? "bg-secondary"
                      : isCurrent
                        ? "bg-secondary/40 ring-1 ring-secondary"
                        : "bg-slate-700"
                  )}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[10px] text-slate-500">
                {completed ? "done" : isCurrent ? "live" : ""}
              </span>
            </div>
          );
        })}
        <span className="ml-1 text-[10px] text-slate-500">
          ({gamesNeeded} to win)
        </span>
      </div>
    </div>
  );
}
