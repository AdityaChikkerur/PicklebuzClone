"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/db/config";
import {
  createCourt,
  fetchCourtsByClubId,
  updateCourt,
  type CourtInput,
} from "@/lib/db/clubs";
import { useAuthStore } from "@/store/authStore";
import type { Court } from "@/types/club";

export interface UseClubCourtsResult {
  courts: Court[];
  loading: boolean;
  error: string | null;
  source: "supabase" | "mock";
  reload: () => void;
  saveCourt: (
    input: CourtInput,
    courtId?: string
  ) => Promise<Court | null>;
}

export function useClubCourts(clubId: string | undefined): UseClubCourtsResult {
  const profile = useAuthStore((s) => s.profile);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "mock">("mock");
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!clubId) {
        setCourts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured() || !profile?.id) {
        if (!cancelled) {
          setCourts([]);
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const rows = await fetchCourtsByClubId(clubId);
        if (!cancelled) {
          setCourts(rows);
          setSource("supabase");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load courts"
          );
          setCourts([]);
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
  }, [clubId, profile?.id, reloadToken]);

  const saveCourt = useCallback(
    async (input: CourtInput, courtId?: string): Promise<Court | null> => {
      if (!isSupabaseConfigured() || source === "mock") {
        const mockCourt: Court = {
          id: courtId ?? `mock-court-${Date.now()}`,
          clubId: input.clubId,
          name: input.name,
          surface: input.surface,
          pricePerHour: input.pricePerHour,
          openFrom: input.openFrom,
          openTo: input.openTo,
        };
        setCourts((prev) => {
          const idx = prev.findIndex((c) => c.id === mockCourt.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = mockCourt;
            return next;
          }
          return [...prev, mockCourt];
        });
        return mockCourt;
      }

      const saved = courtId
        ? await updateCourt(courtId, input)
        : await createCourt(input);

      if (saved) reload();
      return saved;
    },
    [reload, source]
  );

  return {
    courts,
    loading,
    error,
    source,
    reload,
    saveCourt,
  };
}
