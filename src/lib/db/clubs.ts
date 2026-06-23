import { createClient } from "@/lib/supabase";
import type {
  Club,
  Court,
  CourtBooking,
  CourtBookingWithDetails,
  DbClub,
  DbCourt,
  DbCourtBooking,
} from "@/types/club";
import {
  mapDbClub,
  mapDbCourt,
  mapDbCourtBooking,
  mapDbCourtBookingWithDetails,
} from "./mappers";
import { createNotification } from "./notifications";

/** List clubs, optionally filtered by city. Includes court count. */
export async function fetchClubs(city?: string): Promise<Club[]> {
  const supabase = createClient();

  let query = supabase
    .from("clubs")
    .select("*, courts(count)")
    .order("name", { ascending: true });

  if (city?.trim()) {
    query = query.ilike("city", city.trim());
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as (DbClub & { courts: { count: number }[] })[]).map(mapDbClub);
}

/** Clubs owned by a user (club owner dashboard). */
export async function fetchClubsByOwnerId(ownerId: string): Promise<Club[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("clubs")
    .select("*, courts(count)")
    .eq("owner_id", ownerId)
    .order("name", { ascending: true });

  if (error || !data) return [];
  return (data as (DbClub & { courts: { count: number }[] })[]).map(mapDbClub);
}

/** Fetch a single club by id. */
export async function fetchClubById(clubId: string): Promise<Club | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("clubs")
    .select("*, courts(count)")
    .eq("id", clubId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbClub(data as DbClub & { courts: { count: number }[] });
}

/** Courts belonging to a club. */
export async function fetchCourtsByClubId(clubId: string): Promise<Court[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("club_id", clubId)
    .order("name", { ascending: true });

  if (error || !data) return [];
  return (data as DbCourt[]).map(mapDbCourt);
}

/** Bookings for the current player (pass auth user id). */
export async function fetchPlayerBookings(
  playerId: string
): Promise<CourtBookingWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("court_bookings")
    .select(
      `
      *,
      courts (
        name,
        clubs ( name, city )
      )
    `
    )
    .eq("player_id", playerId)
    .order("start_at", { ascending: true });

  if (error || !data) return [];

  return (
    data as (DbCourtBooking & {
      courts: {
        name: string;
        clubs: { name: string; city: string | null } | null;
      } | null;
    })[]
  ).map(mapDbCourtBookingWithDetails);
}

/** Bookings for a court on a given day (for slot availability). */
export async function fetchCourtBookingsForDate(
  courtId: string,
  dateIso: string
): Promise<CourtBooking[]> {
  const supabase = createClient();
  const dayStart = new Date(dateIso);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const { data, error } = await supabase
    .from("court_bookings")
    .select("*")
    .eq("court_id", courtId)
    .gte("start_at", dayStart.toISOString())
    .lt("start_at", dayEnd.toISOString())
    .neq("status", "cancelled");

  if (error || !data) return [];
  return (data as DbCourtBooking[]).map(mapDbCourtBooking);
}

export interface CreateBookingInput {
  courtId: string;
  playerId: string;
  startAt: string;
  endAt: string;
  amount?: number;
}

/** Create a pending court booking for the authenticated player. */
export async function createCourtBooking(
  input: CreateBookingInput
): Promise<CourtBooking | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("court_bookings")
    .insert({
      court_id: input.courtId,
      player_id: input.playerId,
      start_at: input.startAt,
      end_at: input.endAt,
      amount: input.amount ?? null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return mapDbCourtBooking(data as DbCourtBooking);
}

/** Cancel a booking (player or club owner via RLS). */
export async function cancelCourtBooking(
  bookingId: string
): Promise<CourtBooking | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("court_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapDbCourtBooking(data as DbCourtBooking);
}

/** Confirm a pending booking (club owner via RLS) and notify the player. */
export async function confirmCourtBooking(
  bookingId: string
): Promise<CourtBooking | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("court_bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId)
    .select(
      `
      *,
      courts (
        name,
        clubs ( name )
      )
    `
    )
    .single();

  if (error || !data) return null;

  const court = data.courts as {
    name: string;
    clubs: { name: string } | null;
  } | null;
  const clubName = court?.clubs?.name ?? "your club";
  const courtName = court?.name ?? "court";
  const startAt = new Date(data.start_at as string);
  const timeLabel = startAt.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  await createNotification({
    userId: data.player_id as string,
    icon: "📅",
    text: `Court booked: ${clubName}, ${courtName}, ${timeLabel}`,
    link: "/clubs",
  });

  return mapDbCourtBooking(data as DbCourtBooking);
}

export interface CourtInput {
  clubId: string;
  name: string;
  surface: string;
  pricePerHour: number;
  openFrom: string;
  openTo: string;
}

/** Add a court to a club (club owner via RLS). */
export async function createCourt(input: CourtInput): Promise<Court | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("courts")
    .insert({
      club_id: input.clubId,
      name: input.name.trim(),
      surface: input.surface.trim() || null,
      price_per_hour: input.pricePerHour,
      open_from: input.openFrom,
      open_to: input.openTo,
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return mapDbCourt(data as DbCourt);
}

/** Update an existing court (club owner via RLS). */
export async function updateCourt(
  courtId: string,
  input: Omit<CourtInput, "clubId">
): Promise<Court | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("courts")
    .update({
      name: input.name.trim(),
      surface: input.surface.trim() || null,
      price_per_hour: input.pricePerHour,
      open_from: input.openFrom,
      open_to: input.openTo,
    })
    .eq("id", courtId)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapDbCourt(data as DbCourt);
}

/** All bookings for courts owned by a club (club owner dashboard). */
export async function fetchClubBookings(
  clubId: string
): Promise<CourtBookingWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("court_bookings")
    .select(
      `
      *,
      courts!inner (
        name,
        club_id,
        clubs ( name, city )
      )
    `
    )
    .eq("courts.club_id", clubId)
    .order("start_at", { ascending: true });

  if (error || !data) return [];

  return (
    data as (DbCourtBooking & {
      courts: {
        name: string;
        club_id: string;
        clubs: { name: string; city: string | null } | null;
      } | null;
    })[]
  ).map(mapDbCourtBookingWithDetails);
}

/** Bookings across all courts for a club on a given day. */
export async function fetchClubBookingsForDate(
  clubId: string,
  dateIso: string
): Promise<CourtBooking[]> {
  const supabase = createClient();
  const dayStart = new Date(dateIso);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const courts = await fetchCourtsByClubId(clubId);
  const courtIds = courts.map((c) => c.id);
  if (courtIds.length === 0) return [];

  const { data, error } = await supabase
    .from("court_bookings")
    .select("*")
    .in("court_id", courtIds)
    .gte("start_at", dayStart.toISOString())
    .lt("start_at", dayEnd.toISOString())
    .neq("status", "cancelled");

  if (error || !data) return [];
  return (data as DbCourtBooking[]).map(mapDbCourtBooking);
}
