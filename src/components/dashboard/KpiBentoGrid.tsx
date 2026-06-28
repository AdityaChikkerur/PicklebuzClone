"use client";

import {
  ArrowTrendingUpIcon,
  BoltIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { getCurrentSeasonYear } from "@/lib/greeting";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { cn, formatDupr } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  className?: string;
  hero?: boolean;
  alert?: boolean;
}

function KpiCard({ label, value, subtext, icon, className, hero, alert }: KpiCardProps) {
  return (
    <div
      className={cn(
        "card-glow flex flex-col justify-between p-4 sm:p-5 transition-all duration-300 hover:shadow-card-hover",
        hero && "gradient-neon border-0 text-primary-foreground shadow-score",
        alert && "border-red-brand/30 bg-red-light/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-[11px] font-bold uppercase tracking-wider",
            hero ? "text-primary-foreground/80" : alert ? "text-red-brand" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <span
          className={cn(
            "rounded-lg p-1.5",
            hero ? "bg-primary-foreground/15 text-primary-foreground" : alert ? "bg-red-brand/10 text-red-brand" : "bg-muted text-muted-foreground"
          )}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3">
        <p
          className={cn(
            "font-extrabold tabular-nums tracking-tight",
            hero ? "text-4xl sm:text-5xl" : alert ? "text-2xl text-red-brand" : "text-2xl"
          )}
        >
          {value}
        </p>
        {subtext && (
          <p
            className={cn(
              "mt-1 text-xs font-medium",
              hero ? "text-primary-foreground/80" : alert ? "text-red-brand/80" : "text-muted-foreground"
            )}
          >
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

export function KpiBentoGrid() {
  const profile = useAuthStore((s) => s.profile);
  const { kpis, loading, source } = usePlayerStats();
  const rating = profile?.playerRating ?? profile?.duprRating ?? kpis.duprRating;
  const seasonYear = getCurrentSeasonYear();
  const cityLabel = profile?.city ?? "Your city";

  const changeSubtext =
    kpis.duprChange !== 0
      ? `${kpis.duprChange > 0 ? "+" : ""}${kpis.duprChange.toFixed(2)} after last match`
      : source === "supabase"
        ? kpis.matchesPlayed > 0
          ? "From verified matches"
          : "Starts at 3.00. Play to rank up"
        : "Demo stats";

  if (loading) {
    return (
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-24 shimmer rounded-lg" />
          <div className="h-5 w-16 shimmer rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "card-base h-28 shimmer",
                i === 0 && "col-span-2 min-h-[140px] md:row-span-2 md:min-h-[180px]"
              )}
            />
          ))}
        </div>
      </section>
    );
  }

  const faultElevated = kpis.faultRate > 15;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-black italic tracking-tight text-foreground">Your Stats</h2>
        <span className="rounded-full glass px-2.5 py-0.5 text-[11px] font-bold text-primary">
          Season {seasonYear}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard
          hero
          className="col-span-2 min-h-[140px] md:row-span-2 md:min-h-[180px]"
          label="PickleBuzz Rating"
          value={formatDupr(rating)}
          subtext={`${changeSubtext} · ${cityLabel}`}
          icon={<ArrowTrendingUpIcon className="h-5 w-5" aria-hidden="true" />}
        />
        <KpiCard
          label="Win Rate"
          value={`${kpis.winRate}%`}
          subtext="Last 30 days"
          icon={<ChartBarIcon className="h-4 w-4" aria-hidden="true" />}
        />
        <KpiCard
          label="Win Streak"
          value={String(kpis.winStreak)}
          subtext="Current streak"
          icon={<FireIcon className="h-4 w-4" aria-hidden="true" />}
        />
        <KpiCard
          label="Matches Played"
          value={String(kpis.matchesPlayed)}
          subtext="Verified matches"
          icon={<BoltIcon className="h-4 w-4" aria-hidden="true" />}
        />
        <KpiCard
          label="Tournament Wins"
          value={String(kpis.tournamentWins)}
          subtext="Verified only"
          icon={<TrophyIcon className="h-4 w-4" aria-hidden="true" />}
        />
        <KpiCard
          alert={faultElevated}
          className="col-span-2"
          label="Fault Rate"
          value={`${kpis.faultRate}%`}
          subtext={
            faultElevated
              ? "Elevated. May be affecting win rate"
              : "Per match average"
          }
          icon={<ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />}
        />
      </div>
    </section>
  );
}
