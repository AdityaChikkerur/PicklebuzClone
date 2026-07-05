"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { isSupabaseConfigured, isUuid } from "@/lib/db/config";
import {
  createMatchForFixture,
  fetchTournamentBracket,
  fetchTournamentFixtures,
  fetchTournamentPointsTable,
  generateTournamentFixtures,
} from "@/lib/db/fixtures";
import {
  getTournamentBracket,
  getTournamentFixtures,
  getTournamentPointsTable,
} from "@/lib/mock/tournamentMockData";
import { getBracketRounds } from "@/lib/tournament/bracketUtils";
import { useAuthStore } from "@/store/authStore";
import type {
  BracketMatch,
  PointsTableRow,
  TournamentDetail,
  TournamentFixture,
  TournamentRegistration,
} from "@/types/tournament";

export interface UseTournamentCompetitionResult {
  fixtures: TournamentFixture[];
  points: PointsTableRow[];
  bracket: BracketMatch[];
  bracketRounds: string[];
  loading: boolean;
  source: "mock" | "supabase";
  generating: boolean;
  startingFixtureId: string | null;
  bulkStarting: boolean;
  generateFixtures: (categoryId: string) => Promise<boolean>;
  startFixtureMatch: (fixtureId: string) => Promise<string | null>;
  startMultipleFixtureMatches: (fixtureIds: string[]) => Promise<string[]>;
  reload: () => void;
}

export function useTournamentCompetition(
  tournament: TournamentDetail | null,
  registrations: TournamentRegistration[],
  dataSource: "mock" | "supabase" | "none"
): UseTournamentCompetitionResult {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const [fixtures, setFixtures] = useState<TournamentFixture[]>([]);
  const [points, setPoints] = useState<PointsTableRow[]>([]);
  const [bracket, setBracket] = useState<BracketMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [startingFixtureId, setStartingFixtureId] = useState<string | null>(null);
  const [bulkStarting, setBulkStarting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const tournamentId = tournament?.id ?? "";
  const useDb =
    dataSource === "supabase" &&
    isSupabaseConfigured() &&
    isUuid(tournamentId);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    if (!tournament) {
      setFixtures([]);
      setPoints([]);
      setBracket([]);
      return;
    }

    if (dataSource === "mock") {
      setFixtures(getTournamentFixtures(tournament.id));
      setPoints(getTournamentPointsTable(tournament.id));
      setBracket(getTournamentBracket(tournament.id));
      setLoading(false);
      return;
    }

    if (!useDb) {
      setFixtures([]);
      setPoints([]);
      setBracket([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [fx, pt, br] = await Promise.all([
          fetchTournamentFixtures(tournamentId),
          fetchTournamentPointsTable(tournamentId),
          fetchTournamentBracket(tournamentId),
        ]);

        if (!cancelled) {
          setFixtures(fx);
          setPoints(pt);
          setBracket(br);
        }
      } catch {
        if (!cancelled) {
          setFixtures([]);
          setPoints([]);
          setBracket([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [tournament, tournamentId, dataSource, useDb, reloadToken]);

  const bracketRounds = useMemo(() => getBracketRounds(bracket), [bracket]);

  const generateFixtures = useCallback(
    async (categoryId: string): Promise<boolean> => {
      if (!tournament || !userId) {
        toast.error("Sign in as organizer to generate fixtures");
        return false;
      }

      if (dataSource === "mock") {
        toast.info("Fixture generation is available on real tournaments only");
        return false;
      }

      setGenerating(true);
      const result = await generateTournamentFixtures({
        tournament,
        categoryId,
        registrations,
        createdBy: userId,
      });
      setGenerating(false);

      if (result.error) {
        toast.error(result.error);
        return false;
      }

      toast.success(`Generated ${result.data?.count ?? 0} fixtures`);
      reload();
      return true;
    },
    [tournament, userId, dataSource, registrations, reload]
  );

  const startFixtureMatch = useCallback(
    async (fixtureId: string): Promise<string | null> => {
      if (!tournament || !userId) {
        toast.error("Sign in to start a match");
        return null;
      }

      if (dataSource === "mock") {
        toast.info("Start match is available on real tournaments only");
        return null;
      }

      setStartingFixtureId(fixtureId);
      const result = await createMatchForFixture({
        fixtureId,
        tournament,
        registrations,
        createdBy: userId,
      });
      setStartingFixtureId(null);

      if (result.error || !result.data) {
        toast.error(result.error ?? "Could not start match");
        return null;
      }

      toast.success("Match created — open live scoring");
      reload();
      return result.data.matchId;
    },
    [tournament, userId, dataSource, registrations, reload]
  );

  const startMultipleFixtureMatches = useCallback(
    async (fixtureIds: string[]): Promise<string[]> => {
      if (!tournament || !userId || fixtureIds.length === 0) {
        toast.error("Sign in to start matches");
        return [];
      }

      if (dataSource === "mock") {
        toast.info("Bulk start is available on real tournaments only");
        return [];
      }

      setBulkStarting(true);
      const matchIds: string[] = [];

      for (const fixtureId of fixtureIds) {
        const result = await createMatchForFixture({
          fixtureId,
          tournament,
          registrations,
          createdBy: userId,
        });
        if (result.data?.matchId) {
          matchIds.push(result.data.matchId);
        }
      }

      setBulkStarting(false);

      if (matchIds.length === 0) {
        toast.error("Could not start any matches");
        return [];
      }

      toast.success(
        `Started ${matchIds.length} match${matchIds.length === 1 ? "" : "es"} — open each court to score`
      );
      reload();
      return matchIds;
    },
    [tournament, userId, dataSource, registrations, reload]
  );

  return {
    fixtures,
    points,
    bracket,
    bracketRounds,
    loading,
    source: dataSource === "mock" ? "mock" : useDb ? "supabase" : "mock",
    generating,
    startingFixtureId,
    bulkStarting,
    generateFixtures,
    startFixtureMatch,
    startMultipleFixtureMatches,
    reload,
  };
}
