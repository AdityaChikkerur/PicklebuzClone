"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ShareIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { BracketView } from "./BracketView";
import { FixturesList } from "./FixturesList";
import { LiveTab } from "./LiveTab";
import { OverviewTab } from "./OverviewTab";
import { ParticipantsManager } from "./ParticipantsManager";
import { PointsTableView } from "./PointsTableView";
import { ResultsTab } from "./ResultsTab";
import { TournamentHeader } from "./TournamentHeader";
import { TournamentTabBar } from "./TournamentTabBar";
import { useTournamentCompetition } from "@/hooks/useTournamentCompetition";
import { useTournamentDetail } from "@/hooks/useTournamentDetail";
import { updateRegistrationStatus } from "@/lib/db/tournaments";
import { getDefaultHomeForRole } from "@/lib/auth/routeGuards";
import { APP_URL, copyToClipboard } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { createInitialMatchState, useMatchStore } from "@/store/matchStore";
import type { TournamentTab } from "@/types/tournament";
import { CATEGORY_TYPE_LABELS } from "@/types/tournament";

interface TournamentDetailPageProps {
  tournamentId: string;
}

function defaultTab(format: string | undefined): TournamentTab {
  if (format === "knockout") return "bracket";
  if (format === "round_robin" || format === "league") return "points";
  if (format === "group_knockout") return "points";
  return "overview";
}

export function TournamentDetailPage({ tournamentId }: TournamentDetailPageProps) {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const homeHref = getDefaultHomeForRole(profile?.role);
  const resetMatch = useMatchStore((s) => s.resetMatch);
  const setCurrentMatchId = useMatchStore((s) => s.setCurrentMatchId);

  const {
    tournament,
    registrations,
    loading,
    error,
    source,
    reload: reloadDetail,
  } = useTournamentDetail(tournamentId);

  const {
    fixtures,
    points,
    bracket,
    bracketRounds,
    loading: competitionLoading,
    generating,
    startingFixtureId,
    bulkStarting,
    generateFixtures,
    startFixtureMatch,
    startMultipleFixtureMatches,
    reload: reloadCompetition,
  } = useTournamentCompetition(tournament, registrations, source);

  const [activeTab, setActiveTab] = useState<TournamentTab>("overview");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    if (tournament) {
      setActiveTab(defaultTab(tournament.format));
    }
  }, [tournament?.id, tournament?.format, tournament]);

  const filteredFixtures = useMemo(() => {
    if (categoryFilter === "all") return fixtures;
    return fixtures.filter((f) => f.categoryId === categoryFilter);
  }, [fixtures, categoryFilter]);

  const filteredPoints = useMemo(() => {
    if (categoryFilter === "all") return points;
    return points.filter((p) => p.categoryId === categoryFilter);
  }, [points, categoryFilter]);

  const handleRegistrationStatus = async (
    registrationId: string,
    status: "approved" | "rejected"
  ) => {
    const result = await updateRegistrationStatus(registrationId, status);
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    reloadDetail();
    reloadCompetition();
    return true;
  };

  const handleGenerateFixtures = async (categoryId: string) => {
    const ok = await generateFixtures(categoryId);
    if (ok) reloadDetail();
  };

  const handleStartFixture = async (fixtureId: string) => {
    if (!tournament) return;

    const fixture = fixtures.find((f) => f.id === fixtureId);
    const matchId = await startFixtureMatch(fixtureId);
    if (!matchId || !fixture) return;

    const category = tournament.categories.find((c) => c.id === fixture.categoryId);

    resetMatch(
      createInitialMatchState({
        matchId,
        teamAName: fixture.teamA,
        teamBName: fixture.teamB,
        matchType: category?.categoryType === "singles" ? "singles" : "doubles",
        scoringType: tournament.scoringType,
        targetPoints: tournament.pointsToWin,
        bestOf: tournament.bestOf,
        winBy: tournament.winBy,
        maxTimeouts: tournament.maxTimeouts,
        timeoutDuration: tournament.timeoutDuration,
        timeoutsA: tournament.maxTimeouts,
        timeoutsB: tournament.maxTimeouts,
      })
    );
    setCurrentMatchId(matchId);
    router.push(`/live-scoring/${matchId}`);
  };

  const handleStartMultipleFixtures = async (fixtureIds: string[]) => {
    const matchIds = await startMultipleFixtureMatches(fixtureIds);
    if (matchIds.length === 0) return;
    setActiveTab("live");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted-foreground">
          Loading tournament…
        </div>
      </AppLayout>
    );
  }

  if (!tournament) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-foreground">Tournament not found</h1>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <p className="mt-2 text-sm text-muted-foreground">
            This tournament may have been removed or the link is incorrect.
          </p>
          <button
            type="button"
            onClick={() => router.push(homeHref)}
            className="btn-primary mt-6"
          >
            Back to home
          </button>
        </div>
      </AppLayout>
    );
  }

  const handleShare = async () => {
    const url = `${APP_URL}/tournament/${tournament.id}`;
    const ok = await copyToClipboard(url);
    if (ok) toast.success("Tournament link copied");
    else toast.error("Could not copy link");
  };

  const handleRegister = () => {
    router.push(`/tournament/${tournament.id}/register`);
  };

  const showCategoryFilter =
    tournament.categories.length > 1 &&
    ["fixtures", "points", "bracket"].includes(activeTab) &&
    (source === "mock" || fixtures.length > 0 || points.length > 0);

  const showGenerateOnPoints =
    tournament.isOrganizer &&
    source === "supabase" &&
    points.length === 0 &&
    filteredFixtures.length === 0 &&
    (tournament.format === "round_robin" || tournament.format === "league");

  return (
    <AppLayout>
      <div className="mx-auto flex max-w-4xl flex-col gap-4 md:gap-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Share tournament"
          >
            <ShareIcon className="h-4 w-4" aria-hidden="true" />
            Share
          </button>
        </div>

        <TournamentHeader tournament={tournament} onRegister={handleRegister} />

        <TournamentTabBar
          active={activeTab}
          format={tournament.format}
          isOrganizer={tournament.isOrganizer}
          onChange={setActiveTab}
        />

        {showCategoryFilter && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                categoryFilter === "all"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All categories
            </button>
            {tournament.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize ${
                  categoryFilter === cat.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {CATEGORY_TYPE_LABELS[cat.categoryType]}
              </button>
            ))}
          </div>
        )}

        {competitionLoading && source === "supabase" ? (
          <div className="card-base h-48 animate-pulse bg-muted/50" />
        ) : activeTab === "overview" ? (
          <OverviewTab tournament={tournament} />
        ) : activeTab === "fixtures" ? (
          <FixturesList
            fixtures={filteredFixtures}
            isOrganizer={tournament.isOrganizer}
            categories={tournament.categories}
            generating={generating}
            startingFixtureId={startingFixtureId}
            onGenerate={tournament.isOrganizer ? handleGenerateFixtures : undefined}
            onStartMatch={tournament.isOrganizer ? handleStartFixture : undefined}
          />
        ) : activeTab === "bracket" ? (
          <BracketView matches={bracket} rounds={bracketRounds} />
        ) : activeTab === "points" ? (
          <>
            {showGenerateOnPoints && (
              <div className="card-base flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-muted-foreground">
                  Generate round-robin fixtures from approved registrations.
                </p>
                <div className="flex flex-wrap gap-2">
                  {tournament.categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={generating}
                      onClick={() => void handleGenerateFixtures(cat.id)}
                      className="btn-primary text-xs"
                    >
                      {generating
                        ? "Generating…"
                        : CATEGORY_TYPE_LABELS[cat.categoryType]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <PointsTableView rows={filteredPoints} />
          </>
        ) : activeTab === "participants" ? (
          <ParticipantsManager
            tournamentId={tournament.id}
            tournamentName={tournament.name}
            registrations={registrations}
            isOrganizer={tournament.isOrganizer}
            onApprove={(id) => handleRegistrationStatus(id, "approved")}
            onReject={(id) => handleRegistrationStatus(id, "rejected")}
          />
        ) : activeTab === "live" ? (
          <LiveTab
            fixtures={filteredFixtures}
            isOrganizer={tournament.isOrganizer}
            startingFixtureId={startingFixtureId}
            bulkStarting={bulkStarting}
            onStartMatch={
              tournament.isOrganizer ? handleStartFixture : undefined
            }
            onStartMultiple={
              tournament.isOrganizer ? handleStartMultipleFixtures : undefined
            }
          />
        ) : (
          <ResultsTab fixtures={filteredFixtures} />
        )}
      </div>
    </AppLayout>
  );
}
