"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/db/config";
import { fetchDiscoveryPlayers } from "@/lib/db/players";
import { fetchFollowingIds } from "@/lib/db/follows";
import { DISCOVERY_PLAYERS } from "@/lib/mock/extendedMockData";
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
          setPlayers(
            filterMockPlayers(
              DISCOVERY_PLAYERS,
              { ...filters, followingIds },
              excludeUserId
            )
          );
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

        const rows = await fetchDiscoveryPlayers({
          city: filters.city,
          skillLevel: filters.skillLevel,
          intent: filters.intent === "following" ? "all" : filters.intent,
          search: filters.search,
          excludeUserId,
        });

        const filtered =
          filters.intent === "following" && followingIds
            ? rows.filter((p) => followingIds.has(p.id))
            : rows;

        if (cancelled) return;

        setPlayers(filtered);
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
