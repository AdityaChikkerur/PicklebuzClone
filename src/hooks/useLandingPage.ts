"use client";

import { useEffect, useState } from "react";
import { fetchFeaturedTournaments } from "@/lib/db/admin";
import { isSupabaseConfigured } from "@/lib/db/config";
import {
  getFeaturedTournamentsForLanding,
  getLandingLiveMatches,
} from "@/lib/mock/landingMockData";
import type { AdminTournamentRow } from "@/types/admin";

export function useLandingPage() {
  const [liveMatches] = useState(() => getLandingLiveMatches());
  const [featuredTournaments, setFeaturedTournaments] = useState<
    AdminTournamentRow[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"mock" | "supabase">("mock");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setFeaturedTournaments(getFeaturedTournamentsForLanding());
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const rows = await fetchFeaturedTournaments();
        if (!cancelled) {
          setFeaturedTournaments(rows);
          setSource("supabase");
        }
      } catch {
        if (!cancelled) setFeaturedTournaments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    liveMatches,
    featuredTournaments,
    loading,
    source,
  };
}
