"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/db/config";
import { fetchPlayerRankings } from "@/lib/db/rankings";
import { LEADERBOARD_PLAYERS } from "@/components/rankings/mockData";
import { useAuthStore } from "@/store/authStore";
import type { LeaderboardPlayer } from "@/components/rankings/types";

export interface UseRankingsResult {
  players: LeaderboardPlayer[];
  loading: boolean;
  error: string | null;
  source: "supabase" | "mock";
  reload: () => void;
}

export function useRankings(): UseRankingsResult {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
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

      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setPlayers(LEADERBOARD_PLAYERS);
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const rows = await fetchPlayerRankings(userId);
        if (cancelled) return;
        setPlayers(rows);
        setSource("supabase");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load rankings");
          setPlayers([]);
          setSource("supabase");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, reloadToken]);

  return { players, loading, error, source, reload };
}
