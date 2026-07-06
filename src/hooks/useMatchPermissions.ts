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
  const authLoading = useAuthStore((s) => s.loading);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const role = useAuthStore((s) => s.profile?.role);
  const currentMatchId = useMatchStore((s) => s.currentMatchId);

  const [loading, setLoading] = useState(Boolean(matchId));
  const [isCreator, setIsCreator] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [isDelegatedScorer, setIsDelegatedScorer] = useState(false);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);
  const [hasPendingInvites, setHasPendingInvites] = useState(false);
  const [canScoreFromDb, setCanScoreFromDb] = useState(false);

  const isReferee = Boolean(role && REFEREE_ROLES.includes(role));
  const isDemoMatch =
    !matchId || matchId.startsWith("mock-") || !isUuid(matchId);
  const isActiveScoringSession =
    Boolean(userId) && Boolean(matchId) && currentMatchId === matchId;

  useEffect(() => {
    if (!matchId || !isSupabaseConfigured() || !isUuid(matchId)) {
      setIsCreator(isDemoMatch);
      setIsPlayer(isDemoMatch);
      setMatchStatus(isDemoMatch ? "live" : null);
      setCanScoreFromDb(isDemoMatch);
      setLoading(false);
      return;
    }

    if (authLoading) {
      setLoading(true);
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

      const [{ data: players }, { data: scorerRow }, scoreRpc] = await Promise.all([
        supabase
          .from("match_players")
          .select("player_id, invite_status")
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
        userId
          ? supabase.rpc("user_can_score_match", { p_match_id: matchId })
          : Promise.resolve({ data: false, error: null }),
      ]);

      if (cancelled) return;

      const creator = Boolean(userId && match?.created_by === userId);
      const player = Boolean(
        userId && (players ?? []).some((row) => row.player_id === userId)
      );
      const status = (match?.status as string) ?? null;
      const pendingInvites = (players ?? []).some(
        (row) =>
          row.player_id &&
          (row.invite_status as string | undefined) === "pending"
      );

      setIsCreator(creator);
      setIsPlayer(player);
      setIsDelegatedScorer(Boolean(scorerRow));
      setMatchStatus(status);
      setHasPendingInvites(pendingInvites);
      setCanScoreFromDb(!scoreRpc.error && Boolean(scoreRpc.data));
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [matchId, userId, isDemoMatch, authLoading]);

  const isParticipant =
    isCreator || isPlayer || isReferee || isDelegatedScorer;
  const isAwaitingStart =
    !isCreator &&
    (matchStatus === "draft" ||
      (matchStatus === "live" && hasPendingInvites));
  const isLive = isDemoMatch || matchStatus === "live";

  const canScore =
    isDemoMatch ||
    canScoreFromDb ||
    (isLive && isCreator) ||
    (isLive &&
      !isAwaitingStart &&
      (isPlayer || isReferee || isDelegatedScorer));

  return {
    loading: authLoading || loading,
    canScore,
    isSpectator:
      !authLoading &&
      !loading &&
      !canScore &&
      !isAwaitingStart &&
      !isParticipant &&
      !isActiveScoringSession,
    isCreator: isDemoMatch || isCreator,
    isPlayer: isDemoMatch || isPlayer,
    isReferee,
    isDelegatedScorer: isDemoMatch || isDelegatedScorer,
    matchStatus,
    isAwaitingStart,
  };
}
