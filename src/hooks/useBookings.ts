"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/db/config";
import {
  addMockBooking,
  cancelMockBooking,
  getMockPlayerBookings,
} from "@/lib/clubs/mockBookings";
import {
  cancelCourtBooking,
  createCourtBooking,
  fetchPlayerBookings,
  type CreateBookingInput,
} from "@/lib/db/clubs";
import { useAuthStore } from "@/store/authStore";
import type { CourtBooking, CourtBookingWithDetails } from "@/types/club";

export interface UseBookingsResult {
  bookings: CourtBookingWithDetails[];
  loading: boolean;
  error: string | null;
  source: "supabase" | "local";
  reload: () => void;
  createBooking: (input: Omit<CreateBookingInput, "playerId">) => Promise<CourtBooking | null>;
  cancelBooking: (bookingId: string) => Promise<CourtBooking | null>;
}

export function useBookings(): UseBookingsResult {
  const user = useAuthStore((s) => s.user);
  const [bookings, setBookings] = useState<CourtBookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  const loadBookings = useCallback(async () => {
    if (!user?.id) {
      setBookings([]);
      setSource("local");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setBookings(getMockPlayerBookings(user.id));
      setSource("local");
      setLoading(false);
      return;
    }

    try {
      const rows = await fetchPlayerBookings(user.id);
      setBookings(rows);
      setSource("supabase");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
      setBookings([]);
      setSource("supabase");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings, reloadToken]);

  const createBooking = useCallback(
    async (input: Omit<CreateBookingInput, "playerId">) => {
      if (!user?.id) return null;

      let playerId = user.id;

      if (!isSupabaseConfigured()) {
        const booking = addMockBooking({
          courtId: input.courtId,
          playerId,
          startAt: input.startAt,
          endAt: input.endAt,
          amount: input.amount ?? 0,
          status: "pending",
        });
        reload();
        return booking;
      }

      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        playerId = session.session.user.id;
      }

      const booking = await createCourtBooking({ ...input, playerId });
      if (booking) reload();
      return booking;
    },
    [user?.id, reload]
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      if (!isSupabaseConfigured()) {
        const updated = cancelMockBooking(bookingId);
        if (updated) reload();
        return updated;
      }
      const updated = await cancelCourtBooking(bookingId);
      if (updated) reload();
      return updated;
    },
    [reload]
  );

  return {
    bookings,
    loading,
    error,
    source,
    reload,
    createBooking,
    cancelBooking,
  };
}
