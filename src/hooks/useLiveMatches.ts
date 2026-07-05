"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
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
    if (!isSupabaseConfigured() || source !== "supabase") return;

    const supabase = createClient();
    const channel = supabase
      .channel("live-matches-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_events" },
        () => reload()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        () => reload()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        () => reload()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [source, reload]);

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
