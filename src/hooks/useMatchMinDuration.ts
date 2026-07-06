"use client";

import { useEffect, useState } from "react";
import { fetchMatchStatus } from "@/lib/db/matches";
import { isUuid } from "@/lib/db/config";
import type { MatchEvent } from "@/types/match";

const MIN_MATCH_MS = 10 * 60 * 1000;

/**
 * Enforces the 10-minute minimum match duration before allowing end-match.
 * No visible timer — only gates the End action.
 */
export function useMatchMinDuration(
  matchId: string,
  events: MatchEvent[],
  enabled: boolean
) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [canEnd, setCanEnd] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setCanEnd(true);
      return;
    }

    if (!isUuid(matchId)) {
      setCanEnd(true);
      return;
    }

    let cancelled = false;

    async function loadStart() {
      const result = await fetchMatchStatus(matchId);
      if (cancelled) return;

      const fromDb = result.data?.startedAt
        ? new Date(result.data.startedAt).getTime()
        : null;
      const fromEvent = events.length
        ? new Date(events[events.length - 1].createdAt).getTime()
        : null;

      setStartedAt(fromDb ?? fromEvent ?? Date.now());
    }

    void loadStart();
    return () => {
      cancelled = true;
    };
  }, [matchId, enabled, events.length]);

  useEffect(() => {
    if (!enabled || !startedAt) {
      setCanEnd(!enabled);
      return;
    }

    const check = () => {
      setCanEnd(Date.now() - startedAt >= MIN_MATCH_MS);
    };

    check();
    const id = window.setInterval(check, 5000);
    return () => window.clearInterval(id);
  }, [enabled, startedAt]);

  return { canEnd };
}
