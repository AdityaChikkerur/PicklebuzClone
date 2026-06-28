"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { isUuid } from "@/lib/db/config";
import { useAuthStore } from "@/store/authStore";
import { useMatchStore } from "@/store/matchStore";
import type { UserRole } from "@/types/player";

export interface MatchPermissions {
  loading: boolean;
  canScore: boolean;
  isSpectator: boolean;
  isCreator: boolean;
  isPlayer: boolean;
  isReferee: boolean;
}

const REFEREE_ROLES: UserRole[] = ["referee", "admin"];

export function useMatchPermissions(matchId: string | undefined): MatchPermissions {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const role = useAuthStore((s) => s.profile?.role);
  const currentMatchId = useMatchStore((s) => s.currentMatchId);

  const [loading, setLoading] = useState(Boolean(matchId));
  const [isCreator, setIsCreator] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);

  const isReferee = Boolean(role && REFEREE_ROLES.includes(role));
  const isLocalMatch =
    !matchId ||
    matchId.startsWith("mock-") ||
    !isUuid(matchId) ||
    currentMatchId === matchId;

  useEffect(() => {
    if (!matchId || !isSupabaseConfigured() || !isUuid(matchId)) {
      setIsCreator(isLocalMatch);
      setIsPlayer(isLocalMatch);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();

      const { data: match } = await supabase
        .from("matches")
        .select("created_by")
        .eq("id", matchId)
        .maybeSingle();

      const { data: players } = await supabase
        .from("match_players")
        .select("player_id")
        .eq("match_id", matchId);

      if (cancelled) return;

      const creator = Boolean(userId && match?.created_by === userId);
      const player = Boolean(
        userId && (players ?? []).some((row) => row.player_id === userId)
      );

      setIsCreator(creator);
      setIsPlayer(player);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [matchId, userId, isLocalMatch]);

  const canScore =
    isLocalMatch || isCreator || isPlayer || isReferee;

  return {
    loading,
    canScore,
    isSpectator: !canScore,
    isCreator: isLocalMatch || isCreator,
    isPlayer: isLocalMatch || isPlayer,
    isReferee,
  };
}
