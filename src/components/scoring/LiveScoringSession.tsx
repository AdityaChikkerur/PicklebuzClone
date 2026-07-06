"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { useMatchMinDuration } from "@/hooks/useMatchMinDuration";
import { useMatchPermissions } from "@/hooks/useMatchPermissions";
import { useRealtimeMatch } from "@/hooks/useRealtimeMatch";
import {
  cancelMatchByCreator,
  fetchMatchStateOverrides,
  fetchMatchStatus,
} from "@/lib/db/matches";
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
  const [cancelling, setCancelling] = useState(false);

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
    if (
      !permissions.loading &&
      permissions.isSpectator &&
      !awaitingStart &&
      !permissions.isCreator &&
      !permissions.isPlayer
    ) {
      router.replace(`/spectate/${matchId}`);
    }
  }, [
    permissions.loading,
    permissions.isSpectator,
    permissions.isCreator,
    permissions.isPlayer,
    awaitingStart,
    matchId,
    router,
  ]);

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

  const { canEnd: canEndMatch, startedAt: matchStartedAt } = useMatchMinDuration(
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

  const handleCancelMatch = useCallback(async () => {
    if (
      !window.confirm(
        "Cancel this match? Your opponent has not accepted yet — it will be removed from live."
      )
    ) {
      return;
    }

    setCancelling(true);
    const result = await cancelMatchByCreator(matchId);
    setCancelling(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Match cancelled.");
    router.replace("/live-scoring");
  }, [matchId, router]);

  const creatorCanCancel =
    permissions.isCreator &&
    !matchState.isMatchComplete &&
    (awaitingStart || matchState.events.length === 0);

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

  const readOnly =
    !permissions.canScore ||
    ((awaitingStart || permissions.isAwaitingStart) && !permissions.isCreator);

  return (
    <AppLayout hideNav>
      <div className="fixed inset-0 mx-auto flex max-w-lg flex-col arena-bg">
        <LiveScoringHeader
          matchState={matchState}
          onEndMatch={() => setEndModalOpen(true)}
          onShowTimeline={() => setShowTimeline((v) => !v)}
          readOnly={readOnly}
          canEndMatch={canEndMatch}
          matchStartedAt={matchStartedAt}
        />

        <MatchRuleChips matchState={matchState} />

        {creatorCanCancel && (
          <div className="mx-4 mt-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-center">
            <p className="text-sm text-foreground">
              {awaitingStart
                ? matchState.matchType === "doubles" ||
                  matchState.matchType === "mixed"
                  ? "Waiting for an opponent to accept before the match counts toward ratings."
                  : "Waiting for your opponent to accept before the match counts toward ratings."
                : "This match has not started yet. You can cancel it if you no longer want to play."}
            </p>
            <button
              type="button"
              onClick={() => void handleCancelMatch()}
              disabled={cancelling}
              className="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelling ? "Cancelling…" : "Cancel match"}
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {awaitingStart && !permissions.isCreator ? (
            <MatchWaitingPanel
              matchId={matchId}
              teamAName={matchState.teamAName}
              teamBName={matchState.teamBName}
              matchType={matchState.matchType}
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
