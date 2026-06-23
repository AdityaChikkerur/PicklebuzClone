"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/db/config";
import {
  cancelCourtBooking,
  confirmCourtBooking,
  fetchClubBookings,
  fetchClubsByOwnerId,
} from "@/lib/db/clubs";
import {
  EXTENDED_CLUBS,
  MOCK_CLUB_BOOKINGS,
} from "@/lib/mock/extendedMockData";
import { useAuthStore } from "@/store/authStore";
import type { Club, CourtBookingWithDetails } from "@/types/club";

export interface UseClubOwnerBookingsResult {
  ownedClubs: Club[];
  bookings: CourtBookingWithDetails[];
  loading: boolean;
  error: string | null;
  source: "supabase" | "mock";
  reload: () => void;
  confirmBooking: (bookingId: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
}

export function useClubOwnerBookings(): UseClubOwnerBookingsResult {
  const profile = useAuthStore((s) => s.profile);
  const [ownedClubs, setOwnedClubs] = useState<Club[]>([]);
  const [bookings, setBookings] = useState<CourtBookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "mock">("mock");
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  const confirmBooking = useCallback(
    async (bookingId: string): Promise<boolean> => {
      if (!isSupabaseConfigured() || source === "mock") {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "confirmed" as const } : b
          )
        );
        return true;
      }

      const updated = await confirmCourtBooking(bookingId);
      if (updated) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "confirmed" as const } : b
          )
        );
        return true;
      }
      return false;
    },
    [source]
  );

  const cancelBooking = useCallback(
    async (bookingId: string): Promise<boolean> => {
      if (!isSupabaseConfigured() || source === "mock") {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "cancelled" as const } : b
          )
        );
        return true;
      }

      const updated = await cancelCourtBooking(bookingId);
      if (updated) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "cancelled" as const } : b
          )
        );
        return true;
      }
      return false;
    },
    [source]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const isOwner =
        profile?.role === "club_owner" || profile?.role === "admin";

      if (!isOwner) {
        setOwnedClubs([]);
        setBookings([]);
        setLoading(false);
        return;
      }

      const mockOwned = EXTENDED_CLUBS.filter(
        (c) => c.ownerId === "club-owner"
      );
      const mockBookings = MOCK_CLUB_BOOKINGS.filter((b) =>
        mockOwned.some((c) => c.name === b.clubName)
      );

      if (!isSupabaseConfigured() || !profile?.id) {
        if (!cancelled) {
          setOwnedClubs(mockOwned);
          setBookings(mockBookings);
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const clubs = await fetchClubsByOwnerId(profile.id);
        const allBookings = await Promise.all(
          clubs.map((c) => fetchClubBookings(c.id))
        );
        const flat = allBookings.flat();

        if (!cancelled) {
          setOwnedClubs(clubs);
          setBookings(flat);
          setSource("supabase");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load bookings"
          );
          setOwnedClubs([]);
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
  }, [profile?.id, profile?.role, reloadToken]);

  return {
    ownedClubs,
    bookings,
    loading,
    error,
    source,
    reload,
    confirmBooking,
    cancelBooking,
  };
}
