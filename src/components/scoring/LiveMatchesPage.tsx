"use client";

import Link from "next/link";
import {
  MapPinIcon,
  PlusCircleIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { formatRelativeTime } from "@/lib/utils";

export function LiveMatchesPage() {
  const { matches, loading, error, source } = useLiveMatches();

  return (
    <AppLayout title="Live matches">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 md:gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Watch live</p>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Live matches
            </h2>
            <p className="mt-1 text-sm text-foreground/70">
              Tap a match to watch scores update in real time. Only players and
              referees can change the scoreboard.
            </p>
          </div>
          <Link
            href="/match-setup"
            className="btn-primary inline-flex items-center justify-center gap-2 text-sm"
          >
            <PlusCircleIcon className="h-5 w-5" aria-hidden="true" />
            Start new match
          </Link>
        </div>

        {error && source === "mock" && (
          <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}. Showing demo matches.
          </p>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card-base h-36 animate-pulse bg-muted/50"
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
              Start a match or check back when tournaments are in play.
            </p>
            <Link href="/match-setup" className="btn-primary mt-4 inline-block text-sm">
              Create match
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/spectate/${match.id}`}
                className="card-glow group block p-4 transition-all hover:border-primary/40 hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="live" dot>
                      LIVE
                    </Badge>
                    <span className="text-xs capitalize text-muted-foreground">
                      Game {match.gameNumber} · {match.matchType}
                    </span>
                  </div>
                  {match.createdAt && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(match.createdAt)}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="min-w-0 text-right">
                    <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                      {match.teamAName}
                    </p>
                    <p className="font-display text-3xl font-black italic tabular-nums text-primary">
                      {match.scoreA}
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    vs
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                      {match.teamBName}
                    </p>
                    <p className="font-display text-3xl font-black italic tabular-nums text-foreground">
                      {match.scoreB}
                    </p>
                  </div>
                </div>

                {(match.venue || match.city) && (
                  <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {[match.venue, match.city].filter(Boolean).join(", ")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
