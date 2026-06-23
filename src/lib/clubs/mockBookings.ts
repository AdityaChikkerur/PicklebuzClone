import type { CourtBooking, CourtBookingWithDetails } from "@/types/club";
import { generateId } from "@/lib/utils";
import { EXTENDED_CLUBS, EXTENDED_COURTS, MOCK_COURT_BOOKINGS_RAW } from "@/lib/mock/extendedMockData";

const STORAGE_KEY = "picklebuzz-mock-bookings";

function readStorage(): CourtBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CourtBooking[];
  } catch {
    return [];
  }
}

function writeStorage(bookings: CourtBooking[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function getAllMockBookings(): CourtBooking[] {
  return [...MOCK_COURT_BOOKINGS_RAW, ...readStorage()];
}

export function getMockPlayerBookings(playerId: string): CourtBookingWithDetails[] {
  return getAllMockBookings()
    .filter((b) => b.playerId === playerId && b.status !== "cancelled")
    .map(enrichBooking);
}

function enrichBooking(booking: CourtBooking): CourtBookingWithDetails {
  const court = EXTENDED_COURTS.find((c) => c.id === booking.courtId);
  const club = EXTENDED_CLUBS.find((c) => c.id === court?.clubId);
  return {
    ...booking,
    courtName: court?.name ?? "Court",
    clubName: club?.name ?? "Club",
    clubCity: club?.city ?? "",
  };
}

export function addMockBooking(
  input: Omit<CourtBooking, "id" | "status"> & { status?: CourtBooking["status"] }
): CourtBooking {
  const booking: CourtBooking = {
    id: generateId(),
    status: input.status ?? "pending",
    courtId: input.courtId,
    playerId: input.playerId,
    startAt: input.startAt,
    endAt: input.endAt,
    amount: input.amount,
  };
  const stored = readStorage();
  stored.push(booking);
  writeStorage(stored);
  return booking;
}

export function cancelMockBooking(bookingId: string): CourtBooking | null {
  const all = getAllMockBookings();
  const target = all.find((b) => b.id === bookingId);
  if (!target) return null;

  if (MOCK_COURT_BOOKINGS_RAW.some((b) => b.id === bookingId)) {
    return { ...target, status: "cancelled" };
  }

  const stored = readStorage().map((b) =>
    b.id === bookingId ? { ...b, status: "cancelled" as const } : b
  );
  writeStorage(stored);
  return { ...target, status: "cancelled" };
}
