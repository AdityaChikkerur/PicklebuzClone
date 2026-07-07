"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, ShareIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { BracketView } from "./BracketView";
import { FixturesTab } from "./FixturesTab";
import { LiveTab } from "./LiveTab";
import { OverviewTab } from "./OverviewTab";
import { ParticipantsManager } from "./ParticipantsManager";
import { PointsTableView } from "./PointsTableView";
import { ResultsTab } from "./ResultsTab";
import { TournamentHeader } from "./TournamentHeader";
import {
  parseTournamentTabParam,
  TournamentTabBar,
} from "./TournamentTabBar";
import { useTournamentCompetition } from "@/hooks/useTournamentCompetition";
import { useTournamentDetail } from "@/hooks/useTournamentDetail";
import { getDefaultHomeForRole } from "@/lib/auth/routeGuards";
import { updateRegistrationStatus } from "@/lib/db/tournaments";
import {
  fixturesToBracketMatches,
  hasKnockoutBracket,
} from "@/lib/tournament/bracketUtils";
import { APP_URL, copyToClipboard } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { TournamentTab } from "@/types/tournament";
import { getCategoryDisplayName } from "@/types/tournament";

interface TournamentDetailPageProps {
  tournamentId: string;
}

const CATEGORY_FILTER_TABS: TournamentTab[] = [
  "fixtures",
  "bracket",
  "points",
  "live",
  "results",
];

export function TournamentDetailPage({
  tournamentId,
}: TournamentDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const homeHref = getDefaultHomeForRole(profile?.role);

  const { tournament, registrations, loading, error, source, reload: reloadDetail } =
    useTournamentDetail(tournamentId);

  const {
    fixtures,
    points,
    loading: competitionLoading,
    generating,
    startingFixtureId,
    bulkStarting,
    fixtureActionBusy,
    generateFixtures,
    startFixtureMatch,
    startMultipleFixtureMatches,
    handleFixtureAction,
    reload: reloadCompetition,
  } = useTournamentCompetition(
    tournament,
    registrations,
    source,
    userId
  );

  const [activeTab, setActiveTab] = useState<TournamentTab>("overview");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const isOrganizer = Boolean(tournament?.isOrganizer);

  const tabFromUrl = useMemo(
    () =>
      parseTournamentTabParam(
        searchParams.get("tab"),
        isOrganizer,
        tournament?.format
      ),
    [searchParams, isOrganizer, tournament?.format]
  );

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else if (tournament) {
      setActiveTab("overview");
    }
  }, [tournament?.id, tabFromUrl]);

  const handleTabChange = useCallback(
    (tab: TournamentTab) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "overview") {
        params.delete("tab");
      } else if (tab === "participants") {
        params.set("tab", "manage");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(
        query ? `/tournament/${tournamentId}?${query}` : `/tournament/${tournamentId}`,
        { scroll: false }
      );
    },
    [router, searchParams, tournamentId]
  );

  const filteredPoints = useMemo(() => {
    if (categoryFilter === "all") return points ?? [];
    return (points ?? []).filter((p) => p.categoryId === categoryFilter);
  }, [points, categoryFilter]);

  const filteredFixtures = useMemo(() => {
    if (categoryFilter === "all") return fixtures ?? [];
    return (fixtures ?? []).filter((f) => f.categoryId === categoryFilter);
  }, [fixtures, categoryFilter]);

  const bracketMatches = useMemo(
    () => fixturesToBracketMatches(filteredFixtures),
    [filteredFixtures]
  );

  const reloadAll = useCallback(() => {
    reloadDetail();
    reloadCompetition();
  }, [reloadDetail, reloadCompetition]);

  const handleApproveRegistration = useCallback(
    async (registrationId: string) => {
      const result = await updateRegistrationStatus(registrationId, "approved");
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      reloadAll();
      return true;
    },
    [reloadAll]
  );

  const handleRejectRegistration = useCallback(
    async (registrationId: string) => {
      const result = await updateRegistrationStatus(registrationId, "rejected");
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      reloadAll();
      return true;
    },
    [reloadAll]
  );

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
          <h1 className="text-xl font-bold text-foreground">
            Tournament not found
          </h1>

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
    if (tournament.registrationUrl) {
      window.open(tournament.registrationUrl, "_blank", "noopener,noreferrer");
      return;
    }

    router.push(`/tournament/${tournament.id}/register`);
  };

  const showCategoryFilter =
    CATEGORY_FILTER_TABS.includes(activeTab) &&
    tournament.categories.length > 1 &&
    (source === "mock" ||
      filteredFixtures.length > 0 ||
      filteredPoints.length > 0 ||
      activeTab === "fixtures");

  const showBracketTab = hasKnockoutBracket(tournament.format);

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

        <TournamentHeader
          tournament={tournament}
          onRegister={handleRegister}
          onStatusChange={reloadAll}
          onManageSchedule={
            isOrganizer ? () => handleTabChange("fixtures") : undefined
          }
          onManagePlayers={
            isOrganizer ? () => handleTabChange("participants") : undefined
          }
          canDeletePermanent={Boolean(
            userId && tournament.createdBy === userId
          )}
          onDeleted={() => router.push("/tournament")}
        />

        <TournamentTabBar
          active={activeTab}
          onChange={handleTabChange}
          isOrganizer={isOrganizer}
          format={tournament.format}
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
                {getCategoryDisplayName(cat)}
              </button>
            ))}
          </div>
        )}

        {competitionLoading && source === "supabase" && activeTab !== "overview" && activeTab !== "participants" ? (
          <div className="card-base h-48 animate-pulse bg-muted/50" />
        ) : activeTab === "overview" ? (
          <OverviewTab tournament={tournament} />
        ) : activeTab === "fixtures" ? (
          <FixturesTab
            tournament={tournament}
            fixtures={filteredFixtures}
            registrations={registrations}
            isOrganizer={isOrganizer}
            generating={generating}
            startingFixtureId={startingFixtureId}
            fixtureActionBusy={fixtureActionBusy}
            onGenerate={(categoryId) => void generateFixtures(categoryId)}
            onStartMatch={(fixtureId) => void startFixtureMatch(fixtureId)}
            onFixtureAction={handleFixtureAction}
          />
        ) : activeTab === "bracket" && showBracketTab ? (
          <BracketView matches={bracketMatches} />
        ) : activeTab === "points" ? (
          <PointsTableView rows={filteredPoints} />
        ) : activeTab === "live" ? (
          <LiveTab
            fixtures={filteredFixtures}
            isOrganizer={isOrganizer}
            startingFixtureId={startingFixtureId}
            bulkStarting={bulkStarting}
            onStartMatch={(fixtureId) => void startFixtureMatch(fixtureId)}
            onStartMultiple={(ids) => void startMultipleFixtureMatches(ids)}
          />
        ) : activeTab === "participants" && isOrganizer ? (
          <ParticipantsManager
            tournamentId={tournament.id}
            tournamentName={tournament.name}
            registrations={registrations}
            isOrganizer={isOrganizer}
            onApprove={handleApproveRegistration}
            onReject={handleRejectRegistration}
          />
        ) : (
          <ResultsTab fixtures={filteredFixtures} />
        )}
      </div>
    </AppLayout>
  );
}
