"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ShareIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { LiveTab } from "./LiveTab";
import { OverviewTab } from "./OverviewTab";
import { PointsTableView } from "./PointsTableView";
import { ResultsTab } from "./ResultsTab";
import { TournamentHeader } from "./TournamentHeader";
import { TournamentTabBar } from "./TournamentTabBar";
import { useTournamentCompetition } from "@/hooks/useTournamentCompetition";
import { useTournamentDetail } from "@/hooks/useTournamentDetail";
import { getDefaultHomeForRole } from "@/lib/auth/routeGuards";
import { APP_URL, copyToClipboard } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { TournamentTab } from "@/types/tournament";
import { getCategoryDisplayName } from "@/types/tournament";

interface TournamentDetailPageProps {
  tournamentId: string;
}

export function TournamentDetailPage({
  tournamentId,
}: TournamentDetailPageProps) {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const homeHref = getDefaultHomeForRole(profile?.role);

  const { tournament, registrations, loading, error, source } =
    useTournamentDetail(tournamentId);

  const { points, loading: competitionLoading } =
    useTournamentCompetition(tournament, registrations, source);
  
    const fixtures: [] = [];

  const [activeTab, setActiveTab] = useState<TournamentTab>("overview");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    if (tournament) {
      setActiveTab("overview");
    }
  }, [tournament]);

  const filteredPoints = useMemo(() => {
    if (categoryFilter === "all") return points ?? [];
    return (points ?? []).filter((p) => p.categoryId === categoryFilter);
  }, [points, categoryFilter]);

  const filteredFixtures = useMemo(() => {
    return fixtures ?? [];
  }, [fixtures]);

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
    activeTab === "points" &&
    tournament.categories.length > 1 &&
    (source === "mock" || filteredPoints.length > 0);

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

        <TournamentTabBar active={activeTab} onChange={setActiveTab} />

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

        {competitionLoading && source === "supabase" ? (
          <div className="card-base h-48 animate-pulse bg-muted/50" />
        ) : activeTab === "overview" ? (
          <OverviewTab tournament={tournament} />
        ) : activeTab === "points" ? (
          <PointsTableView rows={filteredPoints} />
        ) : activeTab === "live" ? (
          <LiveTab
            fixtures={filteredFixtures}
            isOrganizer={false}
            startingFixtureId={null}
            bulkStarting={false}
          />
        ) : (
          <ResultsTab fixtures={filteredFixtures} />
        )}
      </div>
    </AppLayout>
  );
}