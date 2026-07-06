"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout";
import { useMatchMinDuration } from "@/hooks/useMatchMinDuration";
import { useMatchPermissions } from "@/hooks/useMatchPermissions";
import { useRealtimeMatch } from "@/hooks/useRealtimeMatch";
import { fetchMatchStateOverrides, fetchMatchStatus } from "@/lib/db/matches";
import { fetchMatchInviteSummary } from "@/lib/db/matchPlayerInvites";
import { isUuid } from "@/lib/db/config";
import { useMatchStore, createInitialMatchState } from "@/store/matchStore";
import { ActionButtons } from "./ActionButtons";
import { EndMatchModal } from "./EndMatchModal";
import { FaultCounters } from "./FaultCounters";
import { LiveScoringHeader } from "./LiveScoringHeader";
import { MatchEventsFeed } from "./MatchEventsFeed";
import { MatchInfoBar } from "./MatchInfoBar";
import { MatchRuleChips } from "./MatchRuleChips";
import { MatchScorerPanel } from "./MatchScorerPanel";
import { MatchWaitingPanel } from "./MatchWaitingPanel";
import { ScoreDisplay } from "./ScoreDisplay";
import { TimeoutBar } from "./TimeoutBar";

interface LiveScoringSessionProps {
  matchId: string;
}

export function LiveScoringSession({ matchId }: LiveScoringSessionProps) {
  const router = useRouter();
  const permissions = useMatchPermissions(matchId);
  const matchState = useMatchStore((s) => s.matchState);
  const resetMatch = useMatchStore((s) => s.resetMatch);
  const setCurrentMatchId = useMatchStore((s) => s.setCurrentMatchId);
  const [hydrating, setHydrating] = useState(isUuid(matchId));
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [awaitingStart, setAwaitingStart] = useState(false);

  const reloadMatch = useCallback(async () => {
    const [overrides, statusResult, inviteResult] = await Promise.all([
      fetchMatchStateOverrides(matchId),
      fetchMatchStatus(matchId),
      fetchMatchInviteSummary(matchId),
    ]);

    const status = statusResult.data?.status;
    const invitesPending = Boolean(
      inviteResult.data && !inviteResult.data.allAccepted
    );
    const isAwaiting = status === "draft" || invitesPending;
    setAwaitingStart(isAwaiting);

    if (overrides) {
      resetMatch(
        createInitialMatchState({
          matchId,
          ...overrides,
          isAwaitingStart: isAwaiting,
        })
      );
      setCurrentMatchId(matchId);
    }
  }, [matchId, resetMatch, setCurrentMatchId]);

  useEffect(() => {
    if (!permissions.loading && permissions.isSpectator && !awaitingStart) {
      router.replace(`/spectate/${matchId}`);
    }
  }, [permissions.loading, permissions.isSpectator, awaitingStart, matchId, router]);

  useEffect(() => {
    if (!isUuid(matchId)) {
      setCurrentMatchId(matchId);
      setHydrating(false);
      return;
    }

    let cancelled = false;

    async function hydrate() {
      setHydrating(true);
      await reloadMatch();
      if (!cancelled) setHydrating(false);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [matchId, reloadMatch, setCurrentMatchId]);

  const realtimeEnabled =
    isUuid(matchId) && !awaitingStart && !hydrating && !matchState.isMatchComplete;
  useRealtimeMatch(matchId, realtimeEnabled);

  const { canEnd: canEndMatch } = useMatchMinDuration(
    matchId,
    matchState.events,
    matchState.bestOf >= 3 && !matchState.isMatchComplete
  );

  useEffect(() => {
    if (matchState.isMatchComplete) {
      setEndModalOpen(true);
    }
  }, [matchState.isMatchComplete]);

  const handleMatchStarted = useCallback(() => {
    void reloadMatch();
  }, [reloadMatch]);

  if (permissions.loading || hydrating) {
    return (
      <AppLayout hideNav>
        <div className="flex min-h-screen items-center justify-center arena-bg">
          <p className="font-display text-lg font-black italic text-foreground">
            Loading match…
          </p>
        </div>
      </AppLayout>
    );
  }

  const readOnly = !permissions.canScore || awaitingStart;

  return (
    <AppLayout hideNav>
      <div className="fixed inset-0 mx-auto flex max-w-lg flex-col arena-bg">
        <LiveScoringHeader
          matchState={matchState}
          onEndMatch={() => setEndModalOpen(true)}
          onShowTimeline={() => setShowTimeline((v) => !v)}
          readOnly={readOnly}
          canEndMatch={canEndMatch}
        />

        <MatchRuleChips matchState={matchState} />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {awaitingStart ? (
            <MatchWaitingPanel
              matchId={matchId}
              teamAName={matchState.teamAName}
              teamBName={matchState.teamBName}
              onMatchStarted={handleMatchStarted}
            />
          ) : (
            <>
              <ScoreDisplay
                matchState={matchState}
                readOnly={readOnly}
              />
              <MatchInfoBar matchState={matchState} />
              {!readOnly && <ActionButtons />}
              {!readOnly && <TimeoutBar />}
              {!readOnly && <FaultCounters matchState={matchState} />}
            </>
          )}

          {readOnly && !awaitingStart && (
            <div className="mx-4 mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm text-foreground">
              View-only mode.{" "}
              <Link href={`/spectate/${matchId}`} className="font-semibold text-primary underline">
                Open spectator view
              </Link>
            </div>
          )}
          {showTimeline && (
            <div className="slide-up border-t border-arena-border">
              <MatchEventsFeed events={matchState.events} />
            </div>
          )}
        </div>

        <div className="border-t border-arena-border px-4 py-2 text-center">
          <Link
            href="/live-scoring"
            className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            All live matches →
          </Link>
        </div>

        {!awaitingStart && (
          <MatchScorerPanel
            matchId={matchId}
            teamAName={matchState.teamAName}
            teamBName={matchState.teamBName}
            canManage={permissions.isCreator || permissions.isDelegatedScorer}
          />
        )}

        <EndMatchModal
          open={endModalOpen}
          matchState={matchState}
          onClose={() => setEndModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
