"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { FixtureAction } from "@/components/tournament-detail/FixtureManageMenu";
import { isSupabaseConfigured, isUuid } from "@/lib/db/config";
import {
  createMatchForFixture,
  fetchTournamentFixtures,
  fetchTournamentPointsTable,
  generateTournamentFixtures,
} from "@/lib/db/fixtures";
import {
  abandonTournamentMatch,
  removeTournamentFixture,
  resolveFixtureOutcome,
  scheduleFixture,
  tournamentCancelMatch,
} from "@/lib/db/tournamentMatches";
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
  fixtureActionBusy: boolean;
  generateFixtures: (categoryId: string) => Promise<void>;
  startFixtureMatch: (fixtureId: string) => Promise<string | null>;
  startMultipleFixtureMatches: (fixtureIds: string[]) => Promise<string[]>;
  handleFixtureAction: (
    fixtureId: string,
    action: FixtureAction,
    extra?: {
      winner?: "A" | "B";
      notes?: string;
      scheduledAt?: string;
      court?: string;
    }
  ) => Promise<void>;
  reload: () => void;
}

export function useTournamentCompetition(
  tournament: TournamentDetail | null,
  registrations: TournamentRegistration[],
  dataSource: "mock" | "supabase" | "none",
  createdBy?: string | null
): UseTournamentCompetitionResult {
  const [fixtures, setFixtures] = useState<TournamentFixture[]>([]);
  const [points, setPoints] = useState<PointsTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [startingFixtureId, setStartingFixtureId] = useState<string | null>(null);
  const [bulkStarting, setBulkStarting] = useState(false);
  const [fixtureActionBusy, setFixtureActionBusy] = useState(false);

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

  const generateFixtures = useCallback(
    async (categoryId: string) => {
      if (!tournament) return;

      if (!useDb || !createdBy) {
        toast.error("Fixture generation requires a signed-in organizer account");
        return;
      }

      setGenerating(true);
      const result = await generateTournamentFixtures({
        tournament,
        categoryId,
        registrations,
        createdBy,
      });
      setGenerating(false);

      if (result.error || !result.data) {
        toast.error(result.error ?? "Could not generate fixtures");
        return;
      }

      toast.success(
        `Generated ${result.data.count} fixture${result.data.count === 1 ? "" : "s"}`
      );
      reload();
    },
    [tournament, registrations, createdBy, useDb, reload]
  );

  const startFixtureMatch = useCallback(
    async (fixtureId: string): Promise<string | null> => {
      if (!tournament) return null;

      if (!useDb || !createdBy) {
        toast.error("Starting matches requires a signed-in organizer account");
        return null;
      }

      setStartingFixtureId(fixtureId);
      const result = await createMatchForFixture({
        fixtureId,
        tournament,
        registrations,
        createdBy,
      });
      setStartingFixtureId(null);

      if (result.error || !result.data) {
        toast.error(result.error ?? "Could not start match");
        return null;
      }

      toast.success("Match is live — open scoring to track points");
      reload();
      return result.data.matchId;
    },
    [tournament, registrations, createdBy, useDb, reload]
  );

  const startMultipleFixtureMatches = useCallback(
    async (fixtureIds: string[]): Promise<string[]> => {
      if (!tournament || fixtureIds.length === 0) return [];

      if (!useDb || !createdBy) {
        toast.error("Starting matches requires a signed-in organizer account");
        return [];
      }

      setBulkStarting(true);
      const matchIds: string[] = [];

      for (const fixtureId of fixtureIds) {
        setStartingFixtureId(fixtureId);
        const result = await createMatchForFixture({
          fixtureId,
          tournament,
          registrations,
          createdBy,
        });

        if (result.data?.matchId) {
          matchIds.push(result.data.matchId);
        } else if (result.error) {
          toast.error(result.error);
        }
      }

      setStartingFixtureId(null);
      setBulkStarting(false);

      if (matchIds.length > 0) {
        toast.success(
          `${matchIds.length} match${matchIds.length === 1 ? "" : "es"} are now live`
        );
        reload();
      }

      return matchIds;
    },
    [tournament, registrations, createdBy, useDb, reload]
  );

  const handleFixtureAction = useCallback(
    async (
      fixtureId: string,
      action: FixtureAction,
      extra?: {
        winner?: "A" | "B";
        notes?: string;
        scheduledAt?: string;
        court?: string;
      }
    ) => {
      if (!useDb) {
        toast.error("This action requires a live database connection");
        return;
      }

      const fixture = fixtures.find((f) => f.id === fixtureId);

      setFixtureActionBusy(true);

      try {
        switch (action) {
          case "schedule": {
            if (!extra?.scheduledAt) {
              toast.error("Pick a date and time");
              return;
            }
            const result = await scheduleFixture({
              fixtureId,
              scheduledAt: extra.scheduledAt,
              court: extra.court,
            });
            if (result.error) throw new Error(result.error);
            toast.success("Match scheduled");
            break;
          }
          case "start": {
            await startFixtureMatch(fixtureId);
            return;
          }
          case "walkover":
          case "no_show": {
            const result = await resolveFixtureOutcome({
              fixtureId,
              outcome: action,
              winner: extra?.winner,
              notes: extra?.notes,
            });
            if (result.error) throw new Error(result.error);
            toast.success(
              action === "walkover" ? "Walkover recorded" : "No-show recorded"
            );
            break;
          }
          case "cancel_fixture": {
            const result = await resolveFixtureOutcome({
              fixtureId,
              outcome: "cancelled",
              notes: extra?.notes,
            });
            if (result.error) throw new Error(result.error);
            toast.success("Fixture cancelled");
            break;
          }
          case "cancel_match": {
            if (!fixture?.matchId) {
              toast.error("No linked match to cancel");
              return;
            }
            const result = await tournamentCancelMatch(fixture.matchId);
            if (result.error) throw new Error(result.error);
            toast.success("Match cancelled — fixture is scheduled again");
            break;
          }
          case "abandon": {
            if (!fixture?.matchId) {
              toast.error("No linked match to abandon");
              return;
            }
            const result = await abandonTournamentMatch(
              fixture.matchId,
              extra?.notes
            );
            if (result.error) throw new Error(result.error);
            toast.success("Match abandoned");
            break;
          }
          case "remove": {
            const result = await removeTournamentFixture(fixtureId);
            if (result.error) throw new Error(result.error);
            toast.success("Fixture removed");
            break;
          }
        }

        reload();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update fixture"
        );
      } finally {
        setFixtureActionBusy(false);
      }
    },
    [fixtures, useDb, reload, startFixtureMatch]
  );

  return {
    fixtures,
    points,
    loading,
    source: dataSource === "mock" ? "mock" : useDb ? "supabase" : "mock",
    generating,
    startingFixtureId,
    bulkStarting,
    fixtureActionBusy,
    generateFixtures,
    startFixtureMatch,
    startMultipleFixtureMatches,
    handleFixtureAction,
    reload,
  };
}
