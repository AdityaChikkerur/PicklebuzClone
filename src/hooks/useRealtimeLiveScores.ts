"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { isUuid } from "@/lib/db/config";

export interface LiveScoreSnapshot {
  matchId: string;
  scoreA: number;
  scoreB: number;
  gameNumber: number;
}

async function fetchScoresForMatches(
  matchIds: string[]
): Promise<LiveScoreSnapshot[]> {
  if (matchIds.length === 0) return [];

  const supabase = createClient();
  const { data: rows } = await supabase
    .from("match_events")
    .select("match_id, score_a, score_b, game_number, created_at")
    .in("match_id", matchIds)
    .order("created_at", { ascending: false });

  const latestByMatch = new Map<string, LiveScoreSnapshot>();
  for (const row of rows ?? []) {
    const matchId = row.match_id as string;
    if (latestByMatch.has(matchId)) continue;
    latestByMatch.set(matchId, {
      matchId,
      scoreA: row.score_a ?? 0,
      scoreB: row.score_b ?? 0,
      gameNumber: row.game_number ?? 1,
    });
  }

  return matchIds.map(
    (matchId) =>
      latestByMatch.get(matchId) ?? {
        matchId,
        scoreA: 0,
        scoreB: 0,
        gameNumber: 1,
      }
  );
}

/** Subscribe to score updates for a set of live match ids. */
export function useRealtimeLiveScores(matchIds: string[]) {
  const key = useMemo(
    () =>
      matchIds
        .filter(isUuid)
        .sort()
        .join(","),
    [matchIds]
  );
  const validIds = useMemo(() => (key ? key.split(",") : []), [key]);
  const [scores, setScores] = useState<Record<string, LiveScoreSnapshot>>({});

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    if (validIds.length === 0) {
      setScores((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    let cancelled = false;

    async function hydrate() {
      const snapshots = await fetchScoresForMatches(validIds);
      if (cancelled) return;
      const map: Record<string, LiveScoreSnapshot> = {};
      for (const s of snapshots) {
        map[s.matchId] = s;
      }
      setScores(map);
    }

    void hydrate();

    const supabase = createClient();
    const channel = supabase
      .channel(`live-scores:${key}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_events",
        },
        (payload) => {
          const row = payload.new as {
            match_id: string;
            score_a: number;
            score_b: number;
            game_number: number;
          };
          if (!validIds.includes(row.match_id)) return;
          setScores((prev) => ({
            ...prev,
            [row.match_id]: {
              matchId: row.match_id,
              scoreA: row.score_a,
              scoreB: row.score_b,
              gameNumber: row.game_number,
            },
          }));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [key]);

  return scores;
}
