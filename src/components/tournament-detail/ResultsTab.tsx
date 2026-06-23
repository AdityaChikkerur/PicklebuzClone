"use client";

import Link from "next/link";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import type { TournamentFixture } from "@/types/tournament";

interface ResultsTabProps {
  fixtures: TournamentFixture[];
}

export function ResultsTab({ fixtures }: ResultsTabProps) {
  const completed = fixtures.filter((f) => f.status === "completed");

  if (completed.length === 0) {
    return (
      <div className="card-base p-8 text-center">
        <p className="text-sm font-medium text-foreground">No results yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Completed match results will be listed here.
        </p>
      </div>
    );
  }

  return (
    <div className="card-base divide-y divide-border overflow-hidden">
      <ul>
        {completed.map((fixture) => {
          const winner =
            fixture.score && fixture.teamA
              ? fixture.teamA
              : fixture.teamB;

          return (
            <li key={fixture.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{fixture.round}</Badge>
                    {fixture.isUpset && (
                      <Badge variant="warning">UPSET</Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{fixture.teamA}</span>
                    <span className="mx-1.5 text-muted-foreground">def.</span>
                    <span>{fixture.teamB}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrophyIcon className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                    {winner}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    {fixture.score}
                  </p>
                  {fixture.matchId && (
                    <Link
                      href={`/match/${fixture.matchId}`}
                      className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
                    >
                      Details
                    </Link>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
