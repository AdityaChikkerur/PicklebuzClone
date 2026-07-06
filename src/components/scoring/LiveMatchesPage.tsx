"use client";

import {
  MapPinIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { MultiMatchLiveGrid } from "@/components/scoring/MultiMatchLiveGrid";
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { formatRelativeTime } from "@/lib/utils";

export function LiveMatchesPage() {
  const { matches, loading, error } = useLiveMatches();

  return (
    <AppLayout title="Live matches">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 md:gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Watch live</p>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Live match center
          </h2>
          <p className="mt-1 text-sm text-foreground/70">
            Follow multiple courts at once. Open &quot;Score&quot; in separate tabs to
            run simultaneous matches — each court updates in real time.
          </p>
        </div>

        {error && (
          <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="card-base h-44 animate-pulse bg-muted/50"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="card-base px-6 py-12 text-center">
            <SignalIcon
              className="mx-auto h-10 w-10 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mt-3 font-semibold text-foreground">No live matches right now</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back when tournaments are in play.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="live" dot>
                {matches.length} live court{matches.length === 1 ? "" : "s"}
              </Badge>
              {matches[0]?.createdAt && (
                <span className="text-xs text-muted-foreground">
                  Updated {formatRelativeTime(matches[0].createdAt)}
                </span>
              )}
            </div>

            <MultiMatchLiveGrid
              matches={matches.map((match) => ({
                id: match.id,
                teamAName: match.teamAName,
                teamBName: match.teamBName,
                scoreA: match.scoreA,
                scoreB: match.scoreB,
                gameNumber: match.gameNumber,
                courtLabel: match.courtNumber,
                subtitle: match.matchType,
              }))}
            />

            {(matches.some((m) => m.venue) || matches.some((m) => m.city)) && (
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {[matches[0]?.venue, matches[0]?.city].filter(Boolean).join(", ")}
              </p>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
