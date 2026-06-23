"use client";

import { useCallback, useEffect, useState } from "react";
import { isUuid } from "@/lib/db/config";
import { shouldFetchFromDb } from "@/lib/db/dataSource";
import {
  fetchTournamentById,
  fetchTournamentRegistrations,
} from "@/lib/db/tournaments";
import {
  getTournamentDetail,
  getTournamentRegistrations,
} from "@/lib/mock/tournamentMockData";
import { useAuthStore } from "@/store/authStore";
import type { TournamentDetail, TournamentRegistration } from "@/types/tournament";

export interface UseTournamentDetailResult {
  tournament: TournamentDetail | null;
  registrations: TournamentRegistration[];
  loading: boolean;
  error: string | null;
  source: "mock" | "supabase" | "none";
  reload: () => void;
}

export function useTournamentDetail(
  tournamentId: string
): UseTournamentDetailResult {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const mockTournament = getTournamentDetail(tournamentId);
  const useDb = shouldFetchFromDb(tournamentId) && isUuid(tournamentId);

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(useDb);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    if (mockTournament) {
      setLoading(false);
      setError(null);
      return;
    }

    if (!useDb) {
      setLoading(false);
      setTournament(null);
      setRegistrations([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [detail, regs] = await Promise.all([
          fetchTournamentById(tournamentId, userId),
          fetchTournamentRegistrations(tournamentId),
        ]);

        if (cancelled) return;

        if (!detail) {
          setError("Tournament not found");
          setTournament(null);
          setRegistrations([]);
        } else {
          setTournament(detail);
          setRegistrations(regs);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tournament");
          setTournament(null);
          setRegistrations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [tournamentId, mockTournament, useDb, userId, reloadToken]);

  if (mockTournament) {
    return {
      tournament: mockTournament,
      registrations: getTournamentRegistrations(tournamentId),
      loading: false,
      error: null,
      source: "mock",
      reload,
    };
  }

  return {
    tournament,
    registrations,
    loading,
    error,
    source: useDb ? "supabase" : "none",
    reload,
  };
}
