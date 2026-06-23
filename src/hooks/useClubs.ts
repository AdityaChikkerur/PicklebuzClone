"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/db/config";
import { shouldFetchFromDb } from "@/lib/db/dataSource";
import { fetchClubs, fetchClubById, fetchCourtsByClubId } from "@/lib/db/clubs";
import { EXTENDED_CLUBS, EXTENDED_COURTS } from "@/lib/mock/extendedMockData";
import type { Club, Court } from "@/types/club";

export interface UseClubsResult {
  clubs: Club[];
  loading: boolean;
  error: string | null;
  source: "supabase" | "mock";
  reload: () => void;
}

export function useClubs(city?: string): UseClubsResult {
  const [clubs, setClubs] = useState<Club[]>([]);
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
        const filtered = city
          ? EXTENDED_CLUBS.filter(
              (c) => c.city.toLowerCase() === city.toLowerCase()
            )
          : EXTENDED_CLUBS;
        if (!cancelled) {
          setClubs(filtered);
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const rows = await fetchClubs(city);
        if (cancelled) return;

        setClubs(rows);
        setSource("supabase");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load clubs");
          setClubs([]);
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
  }, [city, reloadToken]);

  return { clubs, loading, error, source, reload };
}

export interface UseClubDetailResult {
  club: Club | null;
  courts: Court[];
  loading: boolean;
  error: string | null;
  source: "supabase" | "mock";
}

export function useClubDetail(clubId: string | null): UseClubDetailResult {
  const [club, setClub] = useState<Club | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(Boolean(clubId));
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "mock">("mock");

  useEffect(() => {
    if (!clubId) {
      setClub(null);
      setCourts([]);
      setLoading(false);
      return;
    }

    const resolvedId = clubId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const mockClub = EXTENDED_CLUBS.find((c) => c.id === resolvedId) ?? null;
      const mockCourts = EXTENDED_COURTS.filter((c) => c.clubId === resolvedId);

      if (!shouldFetchFromDb(resolvedId)) {
        if (!cancelled) {
          setClub(mockClub);
          setCourts(mockCourts);
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const [clubRow, courtRows] = await Promise.all([
          fetchClubById(resolvedId),
          fetchCourtsByClubId(resolvedId),
        ]);

        if (cancelled) return;

        setClub(clubRow);
        setCourts(courtRows);
        setSource("supabase");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load club");
          setClub(null);
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
  }, [clubId]);

  return { club, courts, loading, error, source };
}
