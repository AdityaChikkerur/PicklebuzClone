"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { isUuid } from "@/lib/db/config";
import { getMatchDetail } from "@/lib/mock/extendedMockData";
import { useMatchState } from "@/hooks/useMatchState";
import { useMatchStore, createInitialMatchState } from "@/store/matchStore";
import { MatchInfoBar } from "@/components/scoring/MatchInfoBar";
import { ScoreDisplay, ServeIndicator } from "@/components/scoring/ScoreDisplay";
import { GameScoreChips } from "@/components/match-detail/GameScoreChips";
import type { MatchDetail } from "@/types/match";

interface SpectatePageProps {
  matchId: string;
}

export function SpectatePage({ matchId }: SpectatePageProps) {
  const mockDetail = getMatchDetail(matchId);
  const useDb = isUuid(matchId);

  const {
    loading: dbLoading,
    error: dbError,
    source,
    matchState: dbMatchState,
  } = useMatchState(matchId, { enabled: useDb, realtime: true });

  const storeMatchState = useMatchStore((s) => s.matchState);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  useEffect(() => {
    if (useDb || !mockDetail) return;

    const latestEvent = mockDetail.events[0];
    resetMatch(
      createInitialMatchState({
        matchId: mockDetail.id,
        teamAName: mockDetail.teamAName,
        teamBName: mockDetail.teamBName,
        matchType: mockDetail.matchType,
        gameScores: mockDetail.gameScores,
        scoreA: latestEvent?.scoreA ?? 0,
        scoreB: latestEvent?.scoreB ?? 0,
        currentGame: latestEvent?.gameNumber ?? mockDetail.gameScores.length + 1,
        isMatchComplete:
          mockDetail.status === "verified" || mockDetail.status === "completed",
        matchWinner: mockDetail.winner,
      })
    );
  }, [mockDetail, resetMatch, useDb]);

  const detail: MatchDetail | null = useMemo(() => {
    if (mockDetail) return mockDetail;
    if (source !== "supabase" || dbLoading) return null;

    return {
      id: matchId,
      teamAName: dbMatchState.teamAName,
      teamBName: dbMatchState.teamBName,
      matchType: dbMatchState.matchType,
      matchCategory: "friendly",
      venue: "",
      city: "",
      status: dbMatchState.isMatchComplete ? "completed" : "live",
      winner: dbMatchState.matchWinner,
      createdBy: "",
      createdAt: "",
      completedAt: null,
      gameScores: dbMatchState.gameScores,
      players: [],
      events: dbMatchState.events,
      stats: {
        pointsWonA: 0,
        pointsWonB: 0,
        faultsA: dbMatchState.faultsA,
        faultsB: dbMatchState.faultsB,
        timeoutsUsedA: 0,
        timeoutsUsedB: 0,
        durationMinutes: 0,
      },
      localRules: "",
      isCurrentUserCreator: false,
      isCurrentUserOpponent: false,
      bestPerformer: "",
      hasComeback: false,
    };
  }, [mockDetail, source, dbLoading, matchId, dbMatchState]);

  const matchState = useDb ? dbMatchState : storeMatchState;

  const displayState = useMemo(() => {
    if (!detail) return matchState;
    const isLive = detail.status === "live";
    if (isLive) return matchState;
    return {
      ...matchState,
      isMatchComplete: detail.status !== "live",
      matchWinner: detail.winner,
    };
  }, [detail, matchState]);

  if (useDb && dbLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center arena-bg px-6">
        <p className="font-display text-lg font-black italic text-foreground">Loading match…</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center arena-bg px-6">
        <p className="font-display text-lg font-black italic text-foreground">
          {dbError ?? "Match not found"}
        </p>
        <Link href="/" className="mt-4 text-primary underline">
          Go home
        </Link>
      </div>
    );
  }

  const isLive = detail.status === "live";
  const ended =
    detail.status === "verified" ||
    detail.status === "completed" ||
    detail.status === "pending" ||
    detail.status === "disputed";

  return (
    <div className="fixed inset-0 flex flex-col arena-bg">
      <header className="flex items-center justify-between border-b border-arena-border px-4 py-3 glass">
        <div>
          <p className="tagline text-primary/70">Spectating</p>
          <p className="font-display font-black italic text-foreground">
            {detail.teamAName} vs {detail.teamBName}
          </p>
        </div>
        {isLive && !ended ? (
          <span className="badge-live">LIVE</span>
        ) : (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            ENDED
          </span>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <MatchInfoBar matchState={displayState} />
        <ScoreDisplay matchState={displayState} readOnly />
        <ServeIndicator matchState={displayState} />

        <div className="mx-4 mb-4 rounded-xl border border-border bg-arena-surface px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Spectator mode
          </p>
          <p className="mt-1 text-sm text-foreground">
            Scores update live. Only players and referees can edit the scoreboard.
          </p>
        </div>

        <div className="px-4 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Games
          </p>
          <GameScoreChips
            gameScores={detail.gameScores}
            teamAName={detail.teamAName}
            teamBName={detail.teamBName}
          />
        </div>

        {ended && (
          <div className="mx-4 mb-6 rounded-xl border border-border bg-arena-surface p-4 text-center">
            <p className="font-display font-black italic text-foreground">Match ended</p>
            <Link
              href={`/match/${detail.id}`}
              className="mt-2 inline-block text-sm text-primary underline"
            >
              View full summary
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
