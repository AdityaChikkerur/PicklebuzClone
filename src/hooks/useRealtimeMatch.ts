"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/db/config";
import { useMatchStore } from "@/store/matchStore";
import type { MatchEvent, Team } from "@/types/match";

interface DbMatchEvent {
  id: string;
  match_id: string;
  event_type: MatchEvent["eventType"];
  team: Team | null;
  description: string;
  score_a: number;
  score_b: number;
  game_number: number;
  created_at: string;
}

function mapDbEvent(row: DbMatchEvent): MatchEvent {
  return {
    id: row.id,
    matchId: row.match_id,
    eventType: row.event_type,
    team: row.team,
    description: row.description,
    scoreA: row.score_a,
    scoreB: row.score_b,
    gameNumber: row.game_number,
    createdAt: row.created_at,
  };
}

/**
 * Subscribe to live match_events for a match.
 * Applies incoming events to matchStore so spectator and scorer stay in sync.
 */
export function useRealtimeMatch(
  matchId: string | null,
  enabled = true,
  onRemoteEvent?: () => void
) {
  const setMatchFromDB = useMatchStore((s) => s.setMatchFromDB);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  useEffect(() => {
    if (!matchId || !enabled) return;

    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_events",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const row = payload.new as DbMatchEvent;
          const event = mapDbEvent(row);

          const alreadyHave = useMatchStore
            .getState()
            .matchState.events.some((e) => e.id === event.id);

          if (onRemoteEvent && !alreadyHave) {
            onRemoteEvent();
            return;
          }

          setMatchFromDB({
            scoreA: event.scoreA,
            scoreB: event.scoreB,
            currentGame: event.gameNumber,
            incomingEvent: event,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          const row = payload.new as {
            status: string;
            winner: Team | null;
          };
          if (
            row.status === "completed" ||
            row.status === "verified" ||
            row.status === "pending" ||
            row.status === "disputed"
          ) {
            setMatchFromDB({
              isMatchComplete: true,
              matchWinner: row.winner,
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [matchId, enabled, setMatchFromDB, onRemoteEvent]);
}
