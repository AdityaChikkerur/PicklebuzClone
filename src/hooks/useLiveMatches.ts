"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchLiveMatches, type LiveMatchSummary } from "@/lib/db/matches";

export function useLiveMatches() {
  const [matches, setMatches] = useState<LiveMatchSummary[]>([]);
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

      const result = await fetchLiveMatches();
      if (cancelled) return;

      if (result.error) {
        setError(result.error);
      }

      setMatches(result.data ?? []);
      setSource(result.source);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return { matches, loading, error, source, reload };
}
