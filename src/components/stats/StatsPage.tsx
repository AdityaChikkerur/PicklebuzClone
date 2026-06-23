"use client";

import { AppLayout } from "@/components/layout";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { KpiBentoGrid } from "@/components/dashboard/KpiBentoGrid";
import { PremiumUpsellCard } from "@/components/monetization";
import { PlayerStatsProvider } from "@/hooks/usePlayerStats";
import { LockClosedIcon } from "@heroicons/react/24/outline";

const LOCKED_INSIGHTS = [
  "Head-to-head vs top opponents",
  "Serve win % by court side",
  "Fault heatmap by match type",
  "Weekly DUPR projection",
];

export function StatsPage() {
  return (
    <PlayerStatsProvider>
      <AppLayout title="Stats">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 md:gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Analytics</p>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Player statistics
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified-match stats only. Premium unlocks advanced breakdowns below.
            </p>
          </div>

          <KpiBentoGrid />
          <PerformanceChart />

          <PremiumUpsellCard />

          <section className="card-base p-5">
            <div className="mb-4 flex items-center gap-2">
              <LockClosedIcon
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
              <h3 className="text-sm font-bold text-foreground">
                Premium insights (locked)
              </h3>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {LOCKED_INSIGHTS.map((insight) => (
                <li
                  key={insight}
                  className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                >
                  <LockClosedIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {insight}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </AppLayout>
    </PlayerStatsProvider>
  );
}
