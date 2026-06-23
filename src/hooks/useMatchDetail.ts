"use client";

import { useCallback, useEffect, useState } from "react";
import { isUuid } from "@/lib/db/config";
import { getMatchById, mapFullMatchToDetail } from "@/lib/db/matches";
import { getMatchDetail } from "@/lib/mock/extendedMockData";
import { shouldFetchFromDb } from "@/lib/db/dataSource";
import { useAuthStore } from "@/store/authStore";
import type { MatchDetail } from "@/types/match";

export interface UseMatchDetailResult {
  match: MatchDetail | null;
  loading: boolean;
  error: string | null;
  source: "mock" | "supabase" | "none";
  reload: () => void;
}

export function useMatchDetail(matchId: string): UseMatchDetailResult {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const mockDetail = getMatchDetail(matchId);
  const useDb = shouldFetchFromDb(matchId) && isUuid(matchId);

  const [dbMatch, setDbMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(useDb);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  useEffect(() => {
    if (mockDetail) {
      setLoading(false);
      setError(null);
      return;
    }

    if (!useDb) {
      setLoading(false);
      setDbMatch(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const result = await getMatchById(matchId);

      if (cancelled) return;

      if (result.error) {
        setError(result.error);
        setDbMatch(null);
      } else if (result.data) {
        setDbMatch(mapFullMatchToDetail(result.data, userId));
      } else {
        setError("Match not found");
        setDbMatch(null);
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [matchId, mockDetail, useDb, userId, reloadToken]);

  if (mockDetail) {
    return {
      match: mockDetail,
      loading: false,
      error: null,
      source: "mock",
      reload,
    };
  }

  return {
    match: dbMatch,
    loading,
    error,
    source: useDb ? "supabase" : "none",
    reload,
  };
}
