"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth/clientFetch";
import { fetchRefereeMatches, type RefereeMatch } from "@/lib/db/referee";
import { isSupabaseConfigured } from "@/lib/db/config";

const MOCK_REFEREE_MATCHES: RefereeMatch[] = [];

export function useRefereeDashboard(refereeId: string | undefined) {
  const [matches, setMatches] = useState<RefereeMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"mock" | "supabase">("mock");

  const reload = useCallback(() => {
    if (!refereeId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (!isSupabaseConfigured()) {
      setMatches(MOCK_REFEREE_MATCHES);
      setSource("mock");
      setLoading(false);
      return;
    }

    void fetchRefereeMatches(refereeId).then((rows) => {
      setMatches(rows);
      setSource("supabase");
      setLoading(false);
    });
  }, [refereeId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { matches, loading, source, reload };
}

export function useDuprSync() {
  const [syncing, setSyncing] = useState(false);

  const syncDupr = useCallback(async (duprId: string) => {
    setSyncing(true);
    try {
      const res = await authFetch("/api/dupr/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duprId }),
      });

      const data = (await res.json()) as {
        error?: string;
        duprRating?: number;
        syncedAt?: string;
      };

      if (!res.ok) {
        toast.error(data.error ?? "DUPR sync failed");
        return null;
      }

      toast.success(`DUPR synced — rating ${data.duprRating?.toFixed(2)}`);
      return data;
    } catch {
      toast.error("DUPR sync failed");
      return null;
    } finally {
      setSyncing(false);
    }
  }, []);

  return { syncing, syncDupr };
}
