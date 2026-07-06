"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ClockIcon,
  ShareIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { isUuid } from "@/lib/db/config";
import { useMatchStore } from "@/store/matchStore";
import { formatElapsedClock } from "@/lib/utils";
import type { MatchState } from "@/types/match";

interface LiveScoringHeaderProps {
  matchState: MatchState;
  onEndMatch: () => void;
  onShowTimeline?: () => void;
  readOnly?: boolean;
  canEndMatch?: boolean;
  matchStartedAt?: number | null;
}

export function LiveScoringHeader({
  matchState,
  onEndMatch,
  onShowTimeline,
  readOnly = false,
  canEndMatch = true,
  matchStartedAt = null,
}: LiveScoringHeaderProps) {
  const router = useRouter();
  const currentMatchId = useMatchStore((s) => s.currentMatchId);
  const { currentGame, bestOf, isMatchComplete, scoringType, events } = matchState;

  const fallbackStart = events[0]?.createdAt
    ? new Date(events[0].createdAt).getTime()
    : null;
  const startTime = matchStartedAt ?? fallbackStart;

  const [elapsed, setElapsed] = useState(() =>
    startTime ? formatElapsedClock(startTime) : "0:00"
  );

  const spectateHref =
    currentMatchId && isUuid(currentMatchId)
      ? `/spectate/${currentMatchId}`
      : null;

  useEffect(() => {
    if (isMatchComplete || !startTime) return;
    const id = setInterval(() => setElapsed(formatElapsedClock(startTime)), 1000);
    return () => clearInterval(id);
  }, [startTime, isMatchComplete]);

  const handleShare = async () => {
    const url =
      spectateHref && typeof window !== "undefined"
        ? `${window.location.origin}${spectateHref}`
        : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Match link copied. Share with spectators!");
    } catch {
      toast.info("Match link copied. Share with spectators!");
    }
  };

  return (
    <header className="flex items-center justify-between gap-2 border-b border-arena-border px-3 py-3 sm:px-4">
      <button
        type="button"
        onClick={() => router.push("/live-scoring")}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-arena-surface hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Back to dashboard"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1 text-center">
        <div className="flex items-center justify-center gap-2">
          {!isMatchComplete && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-red-500 live-pulse"
              aria-hidden="true"
            />
          )}
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-brand">
            {isMatchComplete ? "Final" : "Live"}
          </span>
          {!isMatchComplete && startTime && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-muted-foreground">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {elapsed}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
          Game {currentGame} of {bestOf} ·{" "}
          {scoringType === "rally" ? "Rally" : "Side-out"} Scoring
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onShowTimeline && (
          <button
            type="button"
            onClick={onShowTimeline}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-arena-surface hover:text-foreground"
            aria-label="Match timeline"
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-arena-surface hover:text-foreground"
          aria-label="Share match"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
        {spectateHref && !isMatchComplete && (
          <Link
            href={spectateHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl border border-border bg-arena-surface px-2.5 py-1.5 text-[10px] font-bold text-foreground sm:inline-flex"
          >
            Spectate
          </Link>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={onEndMatch}
            disabled={!canEndMatch}
            title={
              canEndMatch
                ? "End match"
                : "Matches must run at least 10 minutes before ending"
            }
            className="rounded-xl bg-red-light px-3 py-1.5 text-xs font-bold text-red-brand transition-colors hover:bg-red-brand/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            End
          </button>
        )}
      </div>
    </header>
  );
}
