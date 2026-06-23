"use client";

import { cn, gamesToWin } from "@/lib/utils";
import { useMatchStore } from "@/store/matchStore";
import type { MatchState } from "@/types/match";

interface ScorePanelProps {
  teamName: string;
  score: number;
  gamesWon: number;
  bestOf: number;
  serving: boolean;
  serverNumber?: 1 | 2;
  side: "left" | "right";
  disabled: boolean;
  onTap: () => void;
}

function ScorePanel({
  teamName,
  score,
  gamesWon,
  bestOf,
  serving,
  serverNumber,
  side,
  disabled,
  onTap,
}: ScorePanelProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onTap}
      className={cn(
        "score-panel min-h-[180px] sm:min-h-[200px]",
        serving
          ? "border-amber-brand/60 bg-amber-brand/10 shadow-score"
          : side === "left"
            ? "border-primary/30 bg-slate-800/60"
            : "border-secondary/30 bg-slate-800/60",
        disabled && "cursor-not-allowed opacity-50"
      )}
      aria-label={`Add point for ${teamName}`}
    >
      {serving && (
        <span className="rounded-full bg-amber-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-brand">
          Serving{serverNumber ? ` · S${serverNumber}` : ""}
        </span>
      )}
      <span
        className={cn(
          "max-w-full truncate text-sm font-bold",
          side === "left" ? "text-primary" : "text-secondary"
        )}
      >
        {teamName}
      </span>
      <span className="text-hero-xl text-slate-50">{score}</span>
      <div className="flex gap-1">
        {Array.from({ length: bestOf }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-2 rounded-full",
              i < gamesWon
                ? side === "left"
                  ? "bg-primary"
                  : "bg-secondary"
                : "bg-slate-600"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      {!disabled && (
        <span className="text-[10px] font-semibold text-slate-500">Tap to add point</span>
      )}
    </button>
  );
}

function countGameWins(matchState: MatchState, team: "A" | "B"): number {
  return matchState.gameScores.filter((g) => g.winner === team).length;
}

interface ScoreDisplayProps {
  matchState: MatchState;
}

export function ScoreDisplay({ matchState }: ScoreDisplayProps) {
  const addPoint = useMatchStore((s) => s.addPoint);
  const {
    scoreA,
    scoreB,
    servingTeam,
    serverNumber,
    teamAName,
    teamBName,
    matchType,
    bestOf,
    isMatchComplete,
  } = matchState;

  const isDoubles = matchType === "doubles" || matchType === "mixed";
  const disabled = isMatchComplete;

  return (
    <div className="relative flex items-stretch gap-2 px-4 py-3 sm:gap-3">
      <ScorePanel
        teamName={teamAName}
        score={scoreA}
        gamesWon={countGameWins(matchState, "A")}
        bestOf={gamesToWin(bestOf)}
        serving={servingTeam === "A" && !isMatchComplete}
        serverNumber={servingTeam === "A" && isDoubles ? serverNumber : undefined}
        side="left"
        disabled={disabled}
        onTap={() => addPoint("A")}
      />
      <div className="flex shrink-0 items-center">
        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
          VS
        </span>
      </div>
      <ScorePanel
        teamName={teamBName}
        score={scoreB}
        gamesWon={countGameWins(matchState, "B")}
        bestOf={gamesToWin(bestOf)}
        serving={servingTeam === "B" && !isMatchComplete}
        serverNumber={servingTeam === "B" && isDoubles ? serverNumber : undefined}
        side="right"
        disabled={disabled}
        onTap={() => addPoint("B")}
      />
    </div>
  );
}

interface ServeIndicatorProps {
  matchState: MatchState;
}

export function ServeIndicator({ matchState }: ServeIndicatorProps) {
  const { servingTeam, serverNumber, teamAName, teamBName, matchType } = matchState;
  const isDoubles = matchType === "doubles" || matchType === "mixed";
  const teamName = servingTeam === "A" ? teamAName : teamBName;

  if (matchState.isMatchComplete) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-2 text-sm text-slate-300">
      <span className="h-2.5 w-2.5 live-pulse rounded-full bg-primary" aria-hidden="true" />
      <span>
        Serving: <span className="font-semibold text-slate-100">{teamName}</span>
        {isDoubles && (
          <span className="ml-1 rounded bg-slate-800 px-1.5 py-0.5 text-xs font-bold text-amber-brand">
            S{serverNumber}
          </span>
        )}
      </span>
    </div>
  );
}