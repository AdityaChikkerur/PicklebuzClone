"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { getBracketRounds } from "@/lib/tournament/bracketUtils";
import type { BracketMatch } from "@/types/tournament";

interface BracketViewProps {
  matches: BracketMatch[];
  rounds?: string[];
}

function MatchCard({ match }: { match: BracketMatch }) {
  const teamAClass =
    match.winner === "A"
      ? "font-bold text-primary"
      : match.winner === "B"
        ? "text-muted-foreground"
        : "text-foreground";
  const teamBClass =
    match.winner === "B"
      ? "font-bold text-primary"
      : match.winner === "A"
        ? "text-muted-foreground"
        : "text-foreground";

  return (
    <div className="w-52 shrink-0 rounded-xl border border-border bg-card p-3 shadow-sm sm:w-56">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Match {match.position + 1}
        </span>
        {match.isUpset && (
          <Badge variant="warning" className="text-[10px]">
            UPSET
          </Badge>
        )}
        {match.status === "live" && (
          <Badge variant="live" dot className="text-[10px]">
            LIVE
          </Badge>
        )}
      </div>

      <div className="space-y-1.5 text-sm">
        <div className={cn("flex items-center justify-between gap-2", teamAClass)}>
          <span className="truncate">
            {match.teamA ?? "TBD"}
            {match.seedA != null && (
              <span className="ml-1 text-xs text-muted-foreground">#{match.seedA}</span>
            )}
          </span>
          {match.winner === "A" && <span aria-hidden="true">✓</span>}
        </div>
        <div className={cn("flex items-center justify-between gap-2", teamBClass)}>
          <span className="truncate">
            {match.teamB ?? "TBD"}
            {match.seedB != null && (
              <span className="ml-1 text-xs text-muted-foreground">#{match.seedB}</span>
            )}
          </span>
          {match.winner === "B" && <span aria-hidden="true">✓</span>}
        </div>
      </div>

      {match.score && (
        <p className="mt-2 text-center text-xs font-bold tabular-nums text-muted-foreground">
          {match.score}
        </p>
      )}
    </div>
  );
}

export function BracketView({ matches, rounds: roundsProp }: BracketViewProps) {
  const rounds = useMemo(
    () => roundsProp ?? getBracketRounds(matches),
    [roundsProp, matches]
  );
  const [activeRound, setActiveRound] = useState(rounds[rounds.length - 1] ?? "Final");

  const roundMatches = matches.filter((m) => m.round === activeRound);

  if (matches.length === 0) {
    return (
      <div className="card-base p-8 text-center">
        <p className="text-sm font-medium text-foreground">Bracket not generated</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The knockout bracket will appear after seeding is complete.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {rounds.map((round) => (
          <button
            key={round}
            type="button"
            onClick={() => setActiveRound(round)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              activeRound === round
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {round}
          </button>
        ))}
      </div>

      <div className="card-base overflow-x-auto p-4">
        <div className="flex min-w-min items-center gap-4">
          {roundMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Scroll horizontally on mobile to view all matches in {activeRound}
      </p>
    </div>
  );
}
