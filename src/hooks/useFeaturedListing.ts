"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchOrganizerFeaturedIds,
  setTournamentFeatured,
} from "@/lib/db/admin";
import { isSupabaseConfigured, isUuid } from "@/lib/db/config";
import { createPaymentPlaceholder } from "@/lib/db/payments";
import { PRICING } from "@/lib/monetization/pricing";
import {
  getOrganizerFeaturedIds,
  toggleOrganizerFeatured,
} from "@/lib/mock/paymentMockData";

export function useFeaturedListing(userId: string | undefined) {
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set());
  const [source, setSource] = useState<"mock" | "supabase">("mock");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isSupabaseConfigured() && userId && isUuid(userId)) {
        const ids = await fetchOrganizerFeaturedIds(userId);
        if (!cancelled) {
          setFeaturedIds(ids);
          setSource("supabase");
        }
        return;
      }

      if (!cancelled) {
        setFeaturedIds(getOrganizerFeaturedIds());
        setSource("mock");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isFeatured = useCallback(
    (tournamentId: string) => featuredIds.has(tournamentId),
    [featuredIds]
  );

  const toggleFeatured = useCallback(
    async (tournamentId: string, tournamentName: string) => {
      if (!userId) {
        toast.error("Sign in to manage listings");
        return;
      }

      const enabling = !featuredIds.has(tournamentId);

      if (enabling) {
        try {
          await createPaymentPlaceholder({
            userId,
            kind: "subscription",
            refId: tournamentId,
            amount: PRICING.featuredTournament,
            status: "pending",
          });
        } catch {
          toast.error("Could not record featured listing");
          return;
        }
      }

      if (source === "supabase") {
        const result = await setTournamentFeatured(tournamentId, enabling);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        setFeaturedIds((prev) => {
          const next = new Set(prev);
          if (enabling) next.add(tournamentId);
          else next.delete(tournamentId);
          return next;
        });
      } else {
        toggleOrganizerFeatured(tournamentId);
        setFeaturedIds(getOrganizerFeaturedIds());
      }

      toast.success(
        enabling
          ? `"${tournamentName}" listed as featured (placeholder — no charge)`
          : `"${tournamentName}" removed from featured listings`
      );
    },
    [userId, featuredIds, source]
  );

  return { isFeatured, toggleFeatured };
}
