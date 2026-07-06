"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchMatchScorers,
  type MatchScorer,
} from "@/lib/db/matchScorers";

export function useMatchScorers(matchId: string | undefined) {
  const [scorers, setScorers] = useState<MatchScorer[]>([]);
  const [loading, setLoading] = useState(Boolean(matchId));
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    if (!matchId) {
      setScorers([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await fetchMatchScorers(matchId!);
      if (cancelled) return;
      setScorers(result.data ?? []);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [matchId, reloadToken]);

  return { scorers, loading, reload };
}
