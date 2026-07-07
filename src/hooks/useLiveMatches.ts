"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { fetchLiveMatches, type LiveMatchSummary } from "@/lib/db/matches";
import { useRealtimeLiveScores } from "@/hooks/useRealtimeLiveScores";
import { useAuthStore } from "@/store/authStore";
import type { MatchTypeFilter } from "@/types/match";

function withCancelForUser(
  matches: LiveMatchSummary[],
  userId: string | null | undefined
): LiveMatchSummary[] {
  if (!userId) return matches;

  return matches.map((match) => {
    const canCancel =
      match.createdBy === userId &&
      (match.canCancel ||
        match.hasPendingInvites ||
        !match.hasScoringEvents);

    return canCancel === match.canCancel ? match : { ...match, canCancel };
  });
}

export function useLiveMatches(matchTypeFilter: MatchTypeFilter = "all") {
  const [matches, setMatches] = useState<LiveMatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "mock">("mock");
  const [reloadToken, setReloadToken] = useState(0);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authLoading = useAuthStore((s) => s.loading);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id ?? null);

  const reload = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  const scheduleReload = useCallback(() => {
    if (reloadTimerRef.current) return;
    reloadTimerRef.current = setTimeout(() => {
      reloadTimerRef.current = null;
      reload();
    }, 400);
  }, [reload]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    const isInitialLoad = reloadToken === 0;

    async function load() {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      const result = await fetchLiveMatches(userId, {
        matchType: matchTypeFilter === "all" ? undefined : matchTypeFilter,
      });
      if (cancelled) return;

      if (result.error) {
        setError(result.error);
      }

      setMatches(withCancelForUser(result.data ?? [], userId));
      setSource(result.source);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken, authLoading, userId, matchTypeFilter]);

  useEffect(() => {
    return () => {
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured() || source !== "supabase") return;

    const supabase = createClient();
    const channel = supabase
      .channel("live-matches-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_events" },
        () => scheduleReload()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        () => scheduleReload()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        () => scheduleReload()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "matches" },
        () => scheduleReload()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [source, scheduleReload]);

  const matchIds = useMemo(() => matches.map((m) => m.id), [matches]);
  const liveScores = useRealtimeLiveScores(matchIds);

  const matchesWithLiveScores = useMemo(
    () =>
      withCancelForUser(
        matches.map((match, index) => {
          const live = liveScores[match.id];
          return {
            ...match,
            scoreA: live?.scoreA ?? match.scoreA,
            scoreB: live?.scoreB ?? match.scoreB,
            gameNumber: live?.gameNumber ?? match.gameNumber,
            courtNumber:
              match.courtNumber?.trim() || `Court ${index + 1}`,
          };
        }),
        userId
      ),
    [matches, liveScores, userId]
  );

  return { matches: matchesWithLiveScores, loading, error, source, reload };
}
