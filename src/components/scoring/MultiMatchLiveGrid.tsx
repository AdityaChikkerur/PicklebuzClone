"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface LiveMatchCardData {
  id: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  gameNumber?: number;
  courtLabel?: string;
  round?: string;
  subtitle?: string;
}

interface MultiMatchLiveGridProps {
  matches: LiveMatchCardData[];
  emptyTitle?: string;
  emptyDescription?: string;
  showScoreButton?: boolean;
  className?: string;
}

export function MultiMatchLiveGrid({
  matches,
  emptyTitle = "No live matches",
  emptyDescription = "Live matches will appear here when play starts.",
  showScoreButton = true,
  className,
}: MultiMatchLiveGridProps) {
  if (matches.length === 0) {
    return (
      <div className="card-base p-8 text-center">
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="mt-1 text-xs text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        matches.length === 1 && "sm:grid-cols-1",
        className
      )}
    >
      {matches.map((match) => (
        <article
          key={match.id}
          className="card-base flex flex-col border-danger/25 bg-danger/5 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="live" dot>
                LIVE
              </Badge>
              {match.courtLabel && (
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {match.courtLabel}
                </span>
              )}
            </div>
            {match.round && (
              <span className="text-xs text-muted-foreground">{match.round}</span>
            )}
          </div>

          <p className="text-center text-base font-bold text-foreground sm:text-lg">
            {match.teamAName}
            <span className="mx-2 text-sm font-normal text-muted-foreground">vs</span>
            {match.teamBName}
          </p>

          <p className="mt-2 text-center text-3xl font-extrabold tabular-nums text-foreground">
            {match.scoreA}
            <span className="mx-2 text-lg font-normal text-muted-foreground">–</span>
            {match.scoreB}
          </p>

          {(match.gameNumber || match.subtitle) && (
            <p className="mt-1 text-center text-xs text-muted-foreground">
              {match.gameNumber ? `Game ${match.gameNumber}` : null}
              {match.gameNumber && match.subtitle ? " · " : null}
              {match.subtitle}
            </p>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href={`/spectate/${match.id}`} className="btn-primary text-sm">
              Spectate
            </Link>
            {showScoreButton && (
              <Link
                href={`/live-scoring/${match.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-sm"
              >
                Score
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
