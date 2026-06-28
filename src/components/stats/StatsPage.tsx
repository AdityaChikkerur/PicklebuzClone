"use client";

import { AppLayout } from "@/components/layout";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { KpiBentoGrid } from "@/components/dashboard/KpiBentoGrid";
import { PremiumUpsellCard } from "@/components/monetization";
import { PlayerStatsProvider } from "@/hooks/usePlayerStats";
import { usePremium } from "@/hooks/usePremium";
import { useAuthStore } from "@/store/authStore";
import {
  ChartBarIcon,
  LockClosedIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const PREMIUM_INSIGHTS = [
  "Head-to-head vs top opponents",
  "Serve win % by court side",
  "Fault heatmap by match type",
  "Weekly DUPR projection",
];

export function StatsPage() {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const { isPremium } = usePremium(userId);

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
              Verified-match stats only.
              {isPremium
                ? " Premium breakdowns are unlocked during your free trial."
                : " Start your free trial to unlock advanced breakdowns below."}
            </p>
          </div>

          <KpiBentoGrid />
          <PerformanceChart />

          {!isPremium && <PremiumUpsellCard />}

          <section className="card-base p-5">
            <div className="mb-4 flex items-center gap-2">
              {isPremium ? (
                <SparklesIcon
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
              ) : (
                <LockClosedIcon
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <h3 className="text-sm font-bold text-foreground">
                {isPremium ? "Premium insights" : "Premium insights (locked)"}
              </h3>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {PREMIUM_INSIGHTS.map((insight) => (
                <li
                  key={insight}
                  className={
                    isPremium
                      ? "flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm text-foreground"
                      : "flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                  }
                >
                  {isPremium ? (
                    <ChartBarIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  ) : (
                    <LockClosedIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
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
