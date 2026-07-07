"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, isUuid } from "@/lib/db/config";
import {
  fetchTournamentFixtures,
  fetchTournamentPointsTable,
} from "@/lib/db/fixtures";
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
        const [pointsData, fixturesData] = await Promise.all([
          fetchTournamentPointsTable(tournamentId),
          fetchTournamentFixtures(tournamentId),
        ]);

        if (!cancelled) {
          setPoints(pointsData);
          setFixtures(fixturesData);
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
