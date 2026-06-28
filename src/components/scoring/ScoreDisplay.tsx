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
  readOnly?: boolean;
  isMatchComplete?: boolean;
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
  readOnly = false,
  isMatchComplete = false,
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
          ? "border-primary/60 bg-primary/10 shadow-score glow-neon-sm"
          : side === "left"
            ? "border-primary/20 bg-arena-surface"
            : "border-border bg-arena-surface",
        disabled && "cursor-not-allowed opacity-50"
      )}
      aria-label={`Add point for ${teamName}`}
    >
      {serving && (
        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          Serving{serverNumber ? ` · S${serverNumber}` : ""}
        </span>
      )}
      <span
        className={cn(
          "max-w-full truncate text-sm font-bold",
          side === "left" ? "text-primary" : "text-foreground"
        )}
      >
        {teamName}
      </span>
      <span className="text-hero-xl text-foreground">{score}</span>
      <div className="flex gap-1">
        {Array.from({ length: bestOf }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-2 rounded-full",
              i < gamesWon
                ? side === "left"
                  ? "bg-primary glow-neon-sm"
                  : "bg-foreground"
                : "bg-muted"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      {!disabled && !readOnly && (
        <span className="text-[10px] font-semibold text-muted-foreground">Tap to add point</span>
      )}
      {readOnly && !isMatchComplete && (
        <span className="text-[10px] font-semibold text-muted-foreground">Watch only</span>
      )}
    </button>
  );
}

function countGameWins(matchState: MatchState, team: "A" | "B"): number {
  return matchState.gameScores.filter((g) => g.winner === team).length;
}

interface ScoreDisplayProps {
  matchState: MatchState;
  readOnly?: boolean;
}

export function ScoreDisplay({ matchState, readOnly = false }: ScoreDisplayProps) {
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
  const disabled = isMatchComplete || readOnly;

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
        readOnly={readOnly}
        isMatchComplete={isMatchComplete}
        onTap={() => addPoint("A")}
      />
      <div className="flex shrink-0 items-center">
        <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
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
        readOnly={readOnly}
        isMatchComplete={isMatchComplete}
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
    <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
      <span className="h-2.5 w-2.5 live-pulse rounded-full bg-primary glow-neon-sm" aria-hidden="true" />
      <span>
        Serving: <span className="font-semibold text-foreground">{teamName}</span>
        {isDoubles && (
          <span className="ml-1 rounded bg-arena-surface px-1.5 py-0.5 text-xs font-bold text-primary">
            S{serverNumber}
          </span>
        )}
      </span>
    </div>
  );
}