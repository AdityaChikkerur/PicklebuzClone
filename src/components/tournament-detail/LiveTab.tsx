"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { TournamentFixture } from "@/types/tournament";

interface LiveTabProps {
  fixtures: TournamentFixture[];
}

export function LiveTab({ fixtures }: LiveTabProps) {
  const live = fixtures.filter((f) => f.status === "live");

  if (live.length === 0) {
    return (
      <div className="card-base p-8 text-center">
        <p className="text-sm font-medium text-foreground">No live matches</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Live tournament matches will appear here during play.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {live.map((fixture) => (
        <div
          key={fixture.id}
          className="card-base border-danger/30 bg-danger/5 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <Badge variant="live" dot>
              LIVE
            </Badge>
            <span className="text-xs text-muted-foreground">{fixture.round}</span>
          </div>

          <p className="text-center text-lg font-bold text-foreground">
            {fixture.teamA}
            <span className="mx-2 text-sm font-normal text-muted-foreground">vs</span>
            {fixture.teamB}
          </p>

          {fixture.score && (
            <p className="mt-2 text-center text-2xl font-extrabold tabular-nums text-foreground">
              {fixture.score}
            </p>
          )}

          <div className="mt-4 flex justify-center gap-3">
            {fixture.matchId ? (
              <>
                <Link
                  href={`/spectate/${fixture.matchId}`}
                  className="btn-primary text-sm"
                >
                  Spectate
                </Link>
                <Link
                  href={`/live-scoring`}
                  className="btn-outline text-sm"
                >
                  Score
                </Link>
              </>
            ) : (
              <Link href="/live-scoring" className="btn-primary text-sm">
                Open scorer
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
