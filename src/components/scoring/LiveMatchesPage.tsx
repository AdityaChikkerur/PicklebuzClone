"use client";

import { useCallback, useState } from "react";
import {
  MapPinIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { MultiMatchLiveGrid } from "@/components/scoring/MultiMatchLiveGrid";
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { cancelMatchByCreator } from "@/lib/db/matches";
import { formatRelativeTime } from "@/lib/utils";
import { CATEGORY_TYPE_LABELS } from "@/types/tournament";
import type { MatchTypeFilter } from "@/types/match";

const TYPE_FILTERS: { id: MatchTypeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "singles", label: CATEGORY_TYPE_LABELS.singles },
  { id: "doubles", label: CATEGORY_TYPE_LABELS.doubles },
  { id: "mixed", label: CATEGORY_TYPE_LABELS.mixed },
];

export function LiveMatchesPage() {
  const [typeFilter, setTypeFilter] = useState<MatchTypeFilter>("all");
  const { matches, loading, error, reload } = useLiveMatches(typeFilter);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = useCallback(
    async (matchId: string) => {
      const match = matches.find((m) => m.id === matchId);
      const label = match
        ? `${match.teamAName} vs ${match.teamBName}`
        : "this match";

      if (
        !window.confirm(
          `Cancel ${label}? Your opponent has not accepted yet — this will remove the match from live.`
        )
      ) {
        return;
      }

      setCancellingId(matchId);
      const result = await cancelMatchByCreator(matchId);
      setCancellingId(null);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Match cancelled.");
      reload();
    },
    [matches, reload]
  );

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

        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setTypeFilter(filter.id)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                typeFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
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
                canCancel: match.canCancel,
              }))}
              onCancel={(matchId) => void handleCancel(matchId)}
              cancellingId={cancellingId}
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
