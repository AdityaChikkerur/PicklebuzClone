"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, isUuid } from "@/lib/db/config";
import { fetchMatchState, type LoadedMatchState } from "@/lib/db/matches";
import { useRealtimeMatch } from "@/hooks/useRealtimeMatch";
import { createInitialMatchState, useMatchStore } from "@/store/matchStore";
import type { MatchRules, MatchState, MatchStatus } from "@/types/match";
import { DEFAULT_FAULTS } from "@/types/match";

export interface UseMatchStateResult {
  loading: boolean;
  error: string | null;
  source: "supabase" | "local";
  matchState: MatchState;
  rules: MatchRules | null;
  reload: () => void;
}

/**
 * Load match rules + live state from Supabase and hydrate the match store.
 * Drives side-out vs rally scoring and serve tracking via `match_rules`.
 */
export function useMatchState(
  matchId: string | null,
  options?: { enabled?: boolean; realtime?: boolean }
): UseMatchStateResult {
  const enabled = options?.enabled ?? true;
  const realtime = options?.realtime ?? true;

  const matchState = useMatchStore((s) => s.matchState);
  const resetMatch = useMatchStore((s) => s.resetMatch);
  const setCurrentMatchId = useMatchStore((s) => s.setCurrentMatchId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [rules, setRules] = useState<MatchRules | null>(null);
  const [dbStatus, setDbStatus] = useState<MatchStatus | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const canFetch =
    enabled &&
    Boolean(matchId) &&
    isSupabaseConfigured() &&
    isUuid(matchId!);

  useRealtimeMatch(
    matchId,
    realtime && canFetch && !loading && dbStatus === "live"
  );

  const reload = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!canFetch || !matchId) {
      setLoading(false);
      setSource("local");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const loaded: LoadedMatchState | null = await fetchMatchState(matchId!);

        if (cancelled) return;

        if (!loaded) {
          setError("Match not found");
          setSource("local");
          return;
        }

        const latest = loaded.events[loaded.events.length - 1];
        const timeoutsUsedA = loaded.events.filter(
          (e) => e.eventType === "timeout" && e.team === "A"
        ).length;
        const timeoutsUsedB = loaded.events.filter(
          (e) => e.eventType === "timeout" && e.team === "B"
        ).length;

        const isComplete =
          loaded.match.status === "completed" ||
          loaded.match.status === "verified" ||
          loaded.match.status === "pending" ||
          loaded.match.status === "disputed";

        resetMatch(
          createInitialMatchState({
            matchId: loaded.match.id,
            teamAName: loaded.match.team_a_name,
            teamBName: loaded.match.team_b_name,
            matchType: loaded.match.match_type,
            scoringType: loaded.rules.scoringType,
            targetPoints: loaded.rules.targetPoints,
            bestOf: loaded.rules.bestOf,
            winBy: loaded.rules.winBy as 1 | 2,
            maxTimeouts: loaded.rules.maxTimeouts,
            timeoutDuration: loaded.rules.timeoutDuration,
            scoreA: latest?.scoreA ?? 0,
            scoreB: latest?.scoreB ?? 0,
            currentGame: latest?.gameNumber ?? loaded.gameScores.length + 1,
            gameScores: loaded.gameScores,
            timeoutsA: Math.max(0, loaded.rules.maxTimeouts - timeoutsUsedA),
            timeoutsB: Math.max(0, loaded.rules.maxTimeouts - timeoutsUsedB),
            events: [...loaded.events].reverse(),
            faultsA: { ...DEFAULT_FAULTS },
            faultsB: { ...DEFAULT_FAULTS },
            isMatchComplete: isComplete,
            matchWinner: loaded.match.winner,
          })
        );
        setCurrentMatchId(loaded.match.id);

        setRules(loaded.rules);
        setDbStatus(loaded.match.status);
        setSource("supabase");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load match");
          setSource("local");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [canFetch, matchId, resetMatch, setCurrentMatchId, reloadToken]);

  return {
    loading,
    error,
    source,
    matchState,
    rules,
    reload,
  };
}
