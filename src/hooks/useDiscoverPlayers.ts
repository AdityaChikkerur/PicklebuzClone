"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/auth/clientFetch";
import { isSupabaseConfigured } from "@/lib/db/config";
import { fetchFollowingIds } from "@/lib/db/follows";
import { DISCOVERY_PLAYERS } from "@/lib/mock/extendedMockData";
import {
  getMockDiscoverBoostMeta,
} from "@/lib/mock/paymentMockData";
import {
  isAnyBoostActive,
  rankDiscoveryPlayers,
} from "@/lib/monetization/profileBoost";
import { useAuthStore } from "@/store/authStore";
import type { Player } from "@/types/player";

export type DiscoverIntent = "all" | "partner" | "match" | "both" | "following";

export interface DiscoverFilters {
  city: string;
  skillLevel: string;
  intent: DiscoverIntent;
  search: string;
  followingIds?: Set<string>;
}

export interface UseDiscoverPlayersResult {
  players: Player[];
  loading: boolean;
  error: string | null;
  source: "supabase" | "mock";
  reload: () => void;
}

function filterMockPlayers(
  players: Player[],
  filters: DiscoverFilters,
  excludeUserId?: string
): Player[] {
  const q = filters.search.trim().toLowerCase();

  return players.filter((p) => {
    if (excludeUserId && p.id === excludeUserId) return false;
    if (filters.city !== "All" && p.city !== filters.city) return false;
    if (filters.skillLevel !== "All" && p.skillLevel !== filters.skillLevel) {
      return false;
    }
    if (filters.intent === "partner" && !p.lookingForPartner) return false;
    if (filters.intent === "match" && !p.lookingForMatch) return false;
    if (
      filters.intent === "both" &&
      !(p.lookingForPartner && p.lookingForMatch)
    ) {
      return false;
    }
    if (filters.followingIds && filters.intent === "following") {
      if (!filters.followingIds.has(p.id)) return false;
    }
    if (!q) return true;
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    );
  });
}

function rankMockDiscoveryPlayers(players: Player[]): Player[] {
  const sortable = players.map((player) => {
    const boost = getMockDiscoverBoostMeta(player.id);
    return {
      ...player,
      boostType: boost.boostType,
      boostExpiresAt: boost.boostExpiresAt,
      adminBoosted: false,
    };
  });

  return rankDiscoveryPlayers(sortable).map(
    ({ boostType: _t, boostExpiresAt: _e, adminBoosted: _a, ...player }) => ({
      ...player,
      isBoosted: isAnyBoostActive({
        id: player.id,
        boostType: _t,
        boostExpiresAt: _e,
        adminBoosted: _a,
      }),
    })
  );
}

function buildDiscoverQuery(
  filters: DiscoverFilters,
  excludeUserId?: string
): string {
  const params = new URLSearchParams();
  if (filters.city && filters.city !== "All") params.set("city", filters.city);
  if (filters.skillLevel && filters.skillLevel !== "All") {
    params.set("skillLevel", filters.skillLevel);
  }
  if (filters.intent && filters.intent !== "following") {
    params.set("intent", filters.intent);
  }
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (excludeUserId) params.set("excludeUserId", excludeUserId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useDiscoverPlayers(
  filters: DiscoverFilters
): UseDiscoverPlayersResult {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const excludeUserId = user?.id ?? profile?.id;
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "mock">("mock");
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured()) {
        if (!cancelled) {
          const followingIds =
            filters.intent === "following" && excludeUserId
              ? await fetchFollowingIds(excludeUserId)
              : undefined;
          const filtered = filterMockPlayers(
            DISCOVERY_PLAYERS,
            { ...filters, followingIds },
            excludeUserId
          );
          setPlayers(rankMockDiscoveryPlayers(filtered));
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const followingIds =
          filters.intent === "following" && excludeUserId
            ? await fetchFollowingIds(excludeUserId)
            : undefined;

        const query = buildDiscoverQuery(
          {
            ...filters,
            intent:
              filters.intent === "following" ? "all" : filters.intent,
          },
          excludeUserId
        );

        const response = await authFetch(`/api/discover/players${query}`);
        const payload = (await response.json().catch(() => null)) as
          | { players?: Player[]; error?: string }
          | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load players");
        }

        let rows = payload?.players ?? [];

        if (filters.intent === "following" && followingIds) {
          rows = rows.filter((p) => followingIds.has(p.id));
        }

        if (cancelled) return;

        setPlayers(rows);
        setSource("supabase");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load players"
          );
          setPlayers([]);
          setSource("supabase");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    filters.city,
    filters.skillLevel,
    filters.intent,
    filters.search,
    excludeUserId,
    reloadToken,
  ]);

  return { players, loading, error, source, reload };
}
