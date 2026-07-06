"use client";

import { useEffect, useState } from "react";
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
  const snapshots: LiveScoreSnapshot[] = [];

  await Promise.all(
    matchIds.map(async (matchId) => {
      const { data } = await supabase
        .from("match_events")
        .select("score_a, score_b, game_number")
        .eq("match_id", matchId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      snapshots.push({
        matchId,
        scoreA: data?.score_a ?? 0,
        scoreB: data?.score_b ?? 0,
        gameNumber: data?.game_number ?? 1,
      });
    })
  );

  return snapshots;
}

/** Subscribe to score updates for a set of live match ids. */
export function useRealtimeLiveScores(matchIds: string[]) {
  const validIds = matchIds.filter(isUuid);
  const key = validIds.sort().join(",");
  const [scores, setScores] = useState<Record<string, LiveScoreSnapshot>>({});

  useEffect(() => {
    if (!isSupabaseConfigured() || validIds.length === 0) {
      setScores({});
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
  }, [key, validIds]);

  return scores;
}
