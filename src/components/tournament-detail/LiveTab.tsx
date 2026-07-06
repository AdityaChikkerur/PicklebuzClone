"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MultiMatchLiveGrid } from "@/components/scoring/MultiMatchLiveGrid";
import { Badge } from "@/components/ui/Badge";
import { useRealtimeLiveScores } from "@/hooks/useRealtimeLiveScores";
import type { TournamentFixture } from "@/types/tournament";

interface LiveTabProps {
  fixtures: TournamentFixture[];
  isOrganizer?: boolean;
  startingFixtureId?: string | null;
  bulkStarting?: boolean;
  onStartMatch?: (fixtureId: string) => void;
  onStartMultiple?: (fixtureIds: string[]) => void;
}

function canStartFixture(fixture: TournamentFixture): boolean {
  return (
    fixture.status === "scheduled" &&
    Boolean(fixture.teamA) &&
    Boolean(fixture.teamB) &&
    fixture.teamB !== "BYE" &&
    fixture.teamA !== "TBD" &&
    fixture.teamB !== "TBD" &&
    !fixture.matchId
  );
}

export function LiveTab({
  fixtures,
  isOrganizer = false,
  startingFixtureId = null,
  bulkStarting = false,
  onStartMatch,
  onStartMultiple,
}: LiveTabProps) {
  const [courtCount, setCourtCount] = useState(4);

  const live = fixtures.filter((f) => f.status === "live" && f.matchId);
  const startable = fixtures.filter(canStartFixture);
  const liveMatchIds = live.map((f) => f.matchId!).filter(Boolean);
  const liveScores = useRealtimeLiveScores(liveMatchIds);

  const liveCards = useMemo(
    () =>
      live.map((fixture, index) => {
        const score = fixture.matchId ? liveScores[fixture.matchId] : undefined;
        const parsed = fixture.score?.split(/[–-]/).map((s) => s.trim());

        return {
          id: fixture.matchId!,
          teamAName: fixture.teamA,
          teamBName: fixture.teamB,
          scoreA: score?.scoreA ?? (parsed?.[0] ? Number(parsed[0]) : 0),
          scoreB: score?.scoreB ?? (parsed?.[1] ? Number(parsed[1]) : 0),
          gameNumber: score?.gameNumber,
          courtLabel: fixture.court ?? `Court ${index + 1}`,
          round: fixture.round,
        };
      }),
    [live, liveScores]
  );

  const handleStartCourts = () => {
    if (!onStartMultiple || startable.length === 0) return;
    const count = Math.min(courtCount, startable.length);
    onStartMultiple(startable.slice(0, count).map((f) => f.id));
  };

  const handleStartAll = () => {
    if (!onStartMultiple || startable.length === 0) return;
    onStartMultiple(startable.map((f) => f.id));
  };

  return (
    <div className="flex flex-col gap-4">
      {isOrganizer && startable.length > 0 && onStartMultiple && (
        <div className="card-base flex flex-col gap-3 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Go live on multiple courts
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {startable.length} match{startable.length === 1 ? "" : "es"} ready —
              score {live.length > 0 ? `${live.length} live, ` : ""}
              up to {courtCount} courts at once.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Courts
              </span>
              <select
                value={courtCount}
                onChange={(e) => setCourtCount(Number(e.target.value))}
                className="input-base w-20 py-1.5 text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={bulkStarting || Boolean(startingFixtureId)}
              onClick={handleStartCourts}
              className="btn-primary shrink-0 text-sm"
            >
              {bulkStarting
                ? "Starting matches…"
                : `Start ${Math.min(courtCount, startable.length)} court${
                    Math.min(courtCount, startable.length) === 1 ? "" : "s"
                  }`}
            </button>
            {startable.length > courtCount && (
              <button
                type="button"
                disabled={bulkStarting || Boolean(startingFixtureId)}
                onClick={handleStartAll}
                className="btn-outline shrink-0 text-sm"
              >
                Start all ({startable.length})
              </button>
            )}
          </div>
        </div>
      )}

      {isOrganizer && startable.length > 0 && onStartMatch && (
        <div className="card-base p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Scheduled — ready to go live
          </p>
          <ul className="divide-y divide-border">
            {startable.map((fixture, index) => (
              <li
                key={fixture.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {fixture.teamA} vs {fixture.teamB}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fixture.round}
                    {fixture.court ? ` · ${fixture.court}` : ` · Court ${index + 1}`}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={startingFixtureId === fixture.id || bulkStarting}
                  onClick={() => onStartMatch(fixture.id)}
                  className="btn-outline shrink-0 text-xs"
                >
                  {startingFixtureId === fixture.id ? "Starting…" : "Go live"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Live now ({live.length})
          </p>
          {live.length > 0 && (
            <Badge variant="live" dot>
              {live.length} court{live.length === 1 ? "" : "s"}
            </Badge>
          )}
        </div>

        {live.length === 0 ? (
          <MultiMatchLiveGrid matches={[]} />
        ) : (
          <>
            <MultiMatchLiveGrid matches={liveCards} />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Open each court in a new tab to score multiple matches simultaneously.{" "}
              <Link href="/live-scoring" className="font-semibold text-primary hover:underline">
                View all live matches
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
