"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, isUuid } from "@/lib/db/config";
import { createClient } from "@/lib/supabase";
import { fetchTournamentPointsTable } from "@/lib/db/fixtures";
import { getTournamentPointsTable } from "@/lib/mock/tournamentMockData";
import type {
  PointsTableRow,
  TournamentDetail,
  TournamentFixture,
  TournamentRegistration,
} from "@/types/tournament";

export interface UseTournamentCompetitionResult {
  fixtures: TournamentFixture[];
  points: PointsTableRow[];
  loading: boolean;
  source: "mock" | "supabase";
  generating: boolean;
  startingFixtureId: string | null;
  bulkStarting: boolean;
  startFixtureMatch: (fixtureId: string) => Promise<string | null>;
  startMultipleFixtureMatches: (fixtureIds: string[]) => Promise<string[]>;
  reload: () => void;
}

type MatchRow = {
  id: string;
  team_a_name: string;
  team_b_name: string;
  match_type: string;
  status: string;
  winner: "A" | "B" | null;
  venue: string | null;
  city: string | null;
  court_number: string | null;
  created_at: string;
  completed_at: string | null;
};

export function useTournamentCompetition(
  tournament: TournamentDetail | null,
  _registrations: TournamentRegistration[],
  dataSource: "mock" | "supabase" | "none"
): UseTournamentCompetitionResult {
  const [fixtures, setFixtures] = useState<TournamentFixture[]>([]);
  const [points, setPoints] = useState<PointsTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const tournamentId = tournament?.id ?? "";

  const useDb =
    dataSource === "supabase" &&
    isSupabaseConfigured() &&
    isUuid(tournamentId);

  const reload = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!tournament) {
      setFixtures([]);
      setPoints([]);
      return;
    }

    if (dataSource === "mock") {
      setFixtures([]);
      setPoints(getTournamentPointsTable(tournament.id));
      setLoading(false);
      return;
    }

    if (!useDb) {
      setFixtures([]);
      setPoints([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const supabase = createClient();

        const [pointsData, matchesResult] = await Promise.all([
          fetchTournamentPointsTable(tournamentId),
          supabase
            .from("matches")
            .select(
              "id, team_a_name, team_b_name, match_type, status, winner, venue, city, court_number, created_at, completed_at"
            )
            .eq("tournament_id", tournamentId)
            .order("created_at", { ascending: false }),
        ]);

        if (matchesResult.error) {
          throw matchesResult.error;
        }

        const mappedFixtures: TournamentFixture[] = (
          (matchesResult.data ?? []) as MatchRow[]
        ).map((match) => ({
          id: match.id,
          tournamentId,
          categoryId: "default",
          round: match.match_type,
          teamA: match.team_a_name,
          teamB: match.team_b_name,
          matchId: match.id,
          score: "",
          court: match.court_number ?? match.venue ?? "",
          scheduledAt: match.completed_at ?? match.created_at,
          status:
            match.status === "live"
              ? "live"
              : match.status === "verified" ||
                  match.status === "completed" ||
                  match.status === "pending"
                ? "completed"
                : "scheduled",
          isUpset: false,
        }));

        if (!cancelled) {
          setPoints(pointsData);
          setFixtures(mappedFixtures);
        }
      } catch (error) {
        console.error("Error loading tournament competition:", error);

        if (!cancelled) {
          setFixtures([]);
          setPoints([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [tournament, tournamentId, dataSource, useDb, reloadToken]);

  return {
    fixtures,
    points,
    loading,
    source: dataSource === "mock" ? "mock" : useDb ? "supabase" : "mock",
    generating: false,
    startingFixtureId: null,
    bulkStarting: false,
    startFixtureMatch: async () => null,
    startMultipleFixtureMatches: async () => [],
    reload,
  };
}