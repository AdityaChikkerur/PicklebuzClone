"use client";

import { useEffect, useState } from "react";
import { shouldFetchFromDb } from "@/lib/db/dataSource";
import { fetchClubBookingsForDate } from "@/lib/db/clubs";
import { getAllMockBookings } from "@/lib/clubs/mockBookings";
import type { Court, CourtBooking } from "@/types/club";

export interface UseCourtAvailabilityResult {
  bookings: CourtBooking[];
  loading: boolean;
  source: "supabase" | "mock";
}

export function useCourtAvailability(
  clubId: string | null,
  dateIso: string,
  courts: Court[]
): UseCourtAvailabilityResult {
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [loading, setLoading] = useState(Boolean(clubId && dateIso));
  const [source, setSource] = useState<"supabase" | "mock">("mock");

  useEffect(() => {
    if (!clubId || !dateIso) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const courtIds = new Set(courts.map((c) => c.id));
    let cancelled = false;

    async function load() {
      setLoading(true);

      const mockForDay = getAllMockBookings().filter((b) => {
        if (!courtIds.has(b.courtId)) return false;
        const day = b.startAt.slice(0, 10);
        return day === dateIso && b.status !== "cancelled";
      });

      if (!clubId || !shouldFetchFromDb(clubId)) {
        if (!cancelled) {
          setBookings(mockForDay);
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const rows = await fetchClubBookingsForDate(clubId, dateIso);
        if (!cancelled) {
          setBookings(rows);
          setSource("supabase");
        }
      } catch {
        if (!cancelled) {
          setBookings([]);
          setSource("supabase");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [clubId, dateIso, courts]);

  return { bookings, loading, source };
}
