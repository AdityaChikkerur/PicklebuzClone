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
import type { MatchState } from "@/types/match";

function formatElapsed(startTime: number): string {
  const secs = Math.floor((Date.now() - startTime) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface LiveScoringHeaderProps {
  matchState: MatchState;
  onEndMatch: () => void;
  onShowTimeline?: () => void;
}

export function LiveScoringHeader({
  matchState,
  onEndMatch,
  onShowTimeline,
}: LiveScoringHeaderProps) {
  const router = useRouter();
  const currentMatchId = useMatchStore((s) => s.currentMatchId);
  const { currentGame, bestOf, isMatchComplete, scoringType, events } = matchState;
  const matchStart = events[0]?.createdAt
    ? new Date(events[0].createdAt).getTime()
    : null;
  const [elapsed, setElapsed] = useState(() =>
    formatElapsed(matchStart ?? Date.now())
  );

  const spectateHref =
    currentMatchId && isUuid(currentMatchId)
      ? `/spectate/${currentMatchId}`
      : null;

  useEffect(() => {
    if (isMatchComplete) return;
    const start = matchStart ?? Date.now();
    const id = setInterval(() => setElapsed(formatElapsed(start)), 1000);
    return () => clearInterval(id);
  }, [matchStart, isMatchComplete]);

  const handleShare = async () => {
    const url =
      spectateHref && typeof window !== "undefined"
        ? `${window.location.origin}${spectateHref}`
        : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Match link copied — share with spectators!");
    } catch {
      toast.info("Match link copied — share with spectators!");
    }
  };

  return (
    <header className="flex items-center justify-between gap-2 border-b border-slate-700/80 px-3 py-3 sm:px-4">
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-400">
            {isMatchComplete ? "Final" : "Live"}
          </span>
          {!isMatchComplete && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-slate-400">
              <ClockIcon className="h-3.5 w-3.5" />
              {elapsed}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
          Game {currentGame} of {bestOf} ·{" "}
          {scoringType === "rally" ? "Rally" : "Side-out"} Scoring
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onShowTimeline && (
          <button
            type="button"
            onClick={onShowTimeline}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            aria-label="Match timeline"
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          aria-label="Share match"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
        {spectateHref && !isMatchComplete && (
          <Link
            href={spectateHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-xl border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-[10px] font-bold text-slate-200 sm:inline-flex"
          >
            Spectate
          </Link>
        )}
        <button
          type="button"
          onClick={onEndMatch}
          className="rounded-xl bg-red-brand/20 px-3 py-1.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-brand/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-brand"
        >
          End
        </button>
      </div>
    </header>
  );
}
