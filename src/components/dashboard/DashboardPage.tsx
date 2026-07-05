"use client";

import { AppLayout } from "@/components/layout";
import { PlayerStatsProvider } from "@/hooks/usePlayerStats";
import { CityRankingsCard } from "./CityRankingsCard";
import { CurrentFormStrip } from "./CurrentFormStrip";
import { DashboardHeader } from "./DashboardHeader";
import { KpiBentoGrid } from "./KpiBentoGrid";
import { PerformanceChart } from "./PerformanceChart";
import { QuickActionsGrid } from "./QuickActionsGrid";
import { RecentMatchesTable } from "./RecentMatchesTable";
import { PremiumUpsellCard } from "@/components/monetization";
import { UpcomingTournamentsCard } from "./UpcomingTournamentsCard";

export function DashboardPage() {
  return (
    <PlayerStatsProvider>
      <AppLayout hideHeader>
        <div className="mx-auto flex min-h-screen w-full max-w-full flex-col gap-5 px-0 pb-32 pt-4 md:max-w-7xl md:gap-6 lg:px-6">
          <DashboardHeader />

          <QuickActionsGrid />
          <KpiBentoGrid />
          <CurrentFormStrip />

          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            <div className="flex flex-col gap-5 lg:col-span-2 lg:gap-6">
              {/* <PerformanceChart /> */}
              <RecentMatchesTable />
            </div>

            <div className="flex flex-col gap-5 lg:gap-6">
              <PremiumUpsellCard compact />
              <CityRankingsCard />
              <UpcomingTournamentsCard />
            </div>
          </div>
        </div>
      </AppLayout>
    </PlayerStatsProvider>
  );
}