export interface Club {
  id: string;
  ownerId: string;
  name: string;
  city: string;
  location: string;
  amenities: string[];
  contact: string;
  rating: number;
  courtCount?: number;
}

/** Supabase row shape for `public.clubs`. */
export interface DbClub {
  id: string;
  owner_id: string;
  name: string;
  city: string | null;
  location: string | null;
  amenities: string[];
  contact: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface Court {
  id: string;
  clubId: string;
  name: string;
  surface: string;
  pricePerHour: number;
  openFrom: string;
  openTo: string;
}

/** Supabase row shape for `public.courts`. */
export interface DbCourt {
  id: string;
  club_id: string;
  name: string;
  surface: string | null;
  price_per_hour: number | null;
  open_from: string | null;
  open_to: string | null;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface CourtBooking {
  id: string;
  courtId: string;
  playerId: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  amount: number;
}

/** Supabase row shape for `public.court_bookings`. */
export interface DbCourtBooking {
  id: string;
  court_id: string;
  player_id: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  amount: number | null;
  created_at: string;
}

export interface CourtBookingWithDetails extends CourtBooking {
  courtName: string;
  clubName: string;
  clubCity: string;
}

export type TimeSlotStatus = "open" | "booked" | "selected";

export interface TimeSlot {
  time: string;
  status: TimeSlotStatus;
}
