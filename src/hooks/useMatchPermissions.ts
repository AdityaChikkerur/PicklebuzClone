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
  isDelegatedScorer: boolean;
  matchStatus: string | null;
  isAwaitingStart: boolean;
}

const REFEREE_ROLES: UserRole[] = ["referee", "admin"];

export function useMatchPermissions(matchId: string | undefined): MatchPermissions {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const role = useAuthStore((s) => s.profile?.role);
  const currentMatchId = useMatchStore((s) => s.currentMatchId);

  const [loading, setLoading] = useState(Boolean(matchId));
  const [isCreator, setIsCreator] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [isDelegatedScorer, setIsDelegatedScorer] = useState(false);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);

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
      setMatchStatus(isLocalMatch ? "live" : null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();

      const { data: match } = await supabase
        .from("matches")
        .select("created_by, status")
        .eq("id", matchId)
        .maybeSingle();

      const [{ data: players }, { data: scorerRow }] = await Promise.all([
        supabase
          .from("match_players")
          .select("player_id")
          .eq("match_id", matchId),
        userId
          ? supabase
              .from("match_scorers")
              .select("id")
              .eq("match_id", matchId)
              .eq("user_id", userId)
              .eq("status", "accepted")
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (cancelled) return;

      const creator = Boolean(userId && match?.created_by === userId);
      const player = Boolean(
        userId && (players ?? []).some((row) => row.player_id === userId)
      );
      const status = (match?.status as string) ?? null;

      setIsCreator(creator);
      setIsPlayer(player);
      setIsDelegatedScorer(Boolean(scorerRow));
      setMatchStatus(status);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [matchId, userId, isLocalMatch]);

  const isAwaitingStart = matchStatus === "draft";
  const isLive = isLocalMatch || matchStatus === "live";

  const canScore =
    isLive &&
    !isAwaitingStart &&
    (isLocalMatch || isCreator || isPlayer || isReferee || isDelegatedScorer);

  return {
    loading,
    canScore,
    isSpectator: !canScore && !isAwaitingStart,
    isCreator: isLocalMatch || isCreator,
    isPlayer: isLocalMatch || isPlayer,
    isReferee,
    isDelegatedScorer: isLocalMatch || isDelegatedScorer,
    matchStatus,
    isAwaitingStart,
  };
}
