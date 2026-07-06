"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, isUuid } from "@/lib/db/config";
import {
  computeCurrentForm,
  computeDashboardKpis,
  computeRecentMatches,
  computeWeeklyPerformance,
  fetchPlayerFaultRate,
  fetchPlayerMatches,
} from "@/lib/db/playerStats";
import { fetchPlayerRankings } from "@/lib/db/rankings";
import {
  CITY_RANKINGS,
  CURRENT_FORM,
  DASHBOARD_KPIS,
  RECENT_MATCHES,
  WEEKLY_PERFORMANCE,
  type DashboardKpis,
  type WeeklyPerformance,
} from "@/components/dashboard/mockData";
import { rankPlayers } from "@/components/rankings/utils";
import { useAuthStore } from "@/store/authStore";
import type { RecentMatch } from "@/types/match";
import type { RankedPlayer } from "@/types/player";

export interface PlayerStatsBundle {
  kpis: DashboardKpis;
  currentForm: ("W" | "L")[];
  recentMatches: RecentMatch[];
  weeklyPerformance: WeeklyPerformance[];
  cityRankings: RankedPlayer[];
  loading: boolean;
  error: string | null;
  source: "supabase" | "mock";
  reload: () => void;
}

const PlayerStatsContext = createContext<PlayerStatsBundle | null>(null);

function mockBundle(profileDupr: number, city: string, userId?: string): PlayerStatsBundle {
  const cityRankings = CITY_RANKINGS.map((p) => ({
    ...p,
    isCurrentUser: userId ? p.id === userId : p.isCurrentUser,
  }));

  return {
    kpis: { ...DASHBOARD_KPIS, duprRating: profileDupr },
    currentForm: CURRENT_FORM,
    recentMatches: RECENT_MATCHES,
    weeklyPerformance: WEEKLY_PERFORMANCE,
    cityRankings,
    loading: false,
    error: null,
    source: "mock",
    reload: () => {},
  };
}

export function PlayerStatsProvider({ children }: { children: ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const dupr = profile?.playerRating ?? profile?.duprRating ?? DASHBOARD_KPIS.duprRating;
  const city = profile?.city ?? "Bangalore";

  const [bundle, setBundle] = useState<PlayerStatsBundle>(() =>
    mockBundle(dupr, city, userId)
  );
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured() || !userId || !isUuid(userId)) {
        if (!cancelled) {
          setBundle({ ...mockBundle(dupr, city, userId), reload });
        }
        return;
      }

      setBundle((prev) => ({ ...prev, loading: true, error: null, source: "supabase" }));

      try {
        const [matches, faultRate, allRankings] = await Promise.all([
          fetchPlayerMatches(userId),
          fetchPlayerFaultRate(userId),
          fetchPlayerRankings(userId),
        ]);

        if (cancelled) return;

        const kpis = {
          ...computeDashboardKpis(matches, dupr),
          faultRate,
        };

        const cityFiltered = allRankings.filter((p) => p.city === city);
        const cityRankings = rankPlayers(cityFiltered, "winpct").slice(0, 6);

        setBundle({
          kpis,
          currentForm: computeCurrentForm(matches),
          recentMatches: computeRecentMatches(matches),
          weeklyPerformance: computeWeeklyPerformance(matches, dupr),
          cityRankings,
          loading: false,
          error: null,
          source: "supabase",
          reload,
        });
      } catch (err) {
        if (!cancelled) {
          setBundle({
            kpis: {
              duprRating: dupr,
              duprChange: 0,
              winRate: 0,
              winStreak: 0,
              matchesPlayed: 0,
              tournamentWins: 0,
              faultRate: 0,
            },
            currentForm: [],
            recentMatches: [],
            weeklyPerformance: computeWeeklyPerformance([], dupr),
            cityRankings: [],
            loading: false,
            error: err instanceof Error ? err.message : "Failed to load stats",
            source: "supabase",
            reload,
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, dupr, city, reloadToken, reload]);

  const value = useMemo(() => bundle, [bundle]);

  return (
    <PlayerStatsContext.Provider value={value}>{children}</PlayerStatsContext.Provider>
  );
}

export function usePlayerStats(): PlayerStatsBundle {
  const ctx = useContext(PlayerStatsContext);
  if (!ctx) {
    throw new Error("usePlayerStats must be used within PlayerStatsProvider");
  }
  return ctx;
}

/** Safe outside PlayerStatsProvider — no-op when provider is absent. */
export function usePlayerStatsReload(): () => void {
  const ctx = useContext(PlayerStatsContext);
  return ctx?.reload ?? (() => {});
}
