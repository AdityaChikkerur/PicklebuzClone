"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { fetchLiveMatches, type LiveMatchSummary } from "@/lib/db/matches";
import { useRealtimeLiveScores } from "@/hooks/useRealtimeLiveScores";

export function useLiveMatches() {
  const [matches, setMatches] = useState<LiveMatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "mock">("mock");
  const [reloadToken, setReloadToken] = useState(0);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    let cancelled = false;
    const isInitialLoad = reloadToken === 0;

    async function load() {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      const result = await fetchLiveMatches();
      if (cancelled) return;

      if (result.error) {
        setError(result.error);
      }

      setMatches(result.data ?? []);
      setSource(result.source);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

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
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [source, scheduleReload]);

  const matchIds = useMemo(() => matches.map((m) => m.id), [matches]);
  const liveScores = useRealtimeLiveScores(matchIds);

  const matchesWithLiveScores = useMemo(
    () =>
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
    [matches, liveScores]
  );

  return { matches: matchesWithLiveScores, loading, error, source, reload };
}
