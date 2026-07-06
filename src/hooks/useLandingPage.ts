"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { fetchFeaturedTournaments } from "@/lib/db/admin";
import { fetchLiveMatches } from "@/lib/db/matches";
import { isSupabaseConfigured } from "@/lib/db/config";
import {
  getFeaturedTournamentsForLanding,
  type LandingLiveMatch,
} from "@/lib/mock/landingMockData";
import type { AdminTournamentRow } from "@/types/admin";

export function useLandingPage() {
  const [liveMatches, setLiveMatches] = useState<LandingLiveMatch[]>([]);
  const [featuredTournaments, setFeaturedTournaments] = useState<
    AdminTournamentRow[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"mock" | "supabase">("mock");

  const reloadLiveMatches = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLiveMatches([]);
      return;
    }

    const result = await fetchLiveMatches();
    setLiveMatches(
      result.data.map((match) => ({
        id: match.id,
        teamAName: match.teamAName,
        teamBName: match.teamBName,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        gameNumber: match.gameNumber,
        venue: match.venue,
        city: match.city,
        matchType: match.matchType,
      }))
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          setFeaturedTournaments(getFeaturedTournamentsForLanding());
          setLiveMatches([]);
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const [rows] = await Promise.all([
          fetchFeaturedTournaments(),
          reloadLiveMatches(),
        ]);
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
  }, [reloadLiveMatches]);

  useEffect(() => {
    if (!isSupabaseConfigured() || source !== "supabase") return;

    const supabase = createClient();
    const channel = supabase
      .channel("landing-live-matches")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        () => void reloadLiveMatches()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        () => void reloadLiveMatches()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_events" },
        () => void reloadLiveMatches()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [source, reloadLiveMatches]);

  return {
    liveMatches,
    featuredTournaments,
    loading,
    source,
  };
}
