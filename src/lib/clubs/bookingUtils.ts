import type { CourtBooking, TimeSlot } from "@/types/club";

/** Parse "HH:MM" into minutes from midnight. */
function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Format minutes from midnight as "HH:MM". */
function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Hourly slots between open and close (exclusive of close hour). */
export function generateHourlySlots(openFrom: string, openTo: string): string[] {
  const start = parseTime(openFrom);
  const end = parseTime(openTo);
  const slots: string[] = [];

  for (let t = start; t + 60 <= end; t += 60) {
    slots.push(formatMinutes(t));
  }

  return slots;
}

function bookingOverlapsSlot(
  booking: CourtBooking,
  dateIso: string,
  slotTime: string
): boolean {
  if (booking.status === "cancelled") return false;

  const slotStart = new Date(`${dateIso}T${slotTime}:00`);
  const slotEnd = new Date(slotStart);
  slotEnd.setHours(slotEnd.getHours() + 1);

  const bookingStart = new Date(booking.startAt);
  const bookingEnd = new Date(booking.endAt);

  return slotStart < bookingEnd && slotEnd > bookingStart;
}

export function buildTimeSlots(
  openFrom: string,
  openTo: string,
  dateIso: string,
  courtId: string,
  bookings: CourtBooking[],
  selectedTime?: string
): TimeSlot[] {
  const courtBookings = bookings.filter((b) => b.courtId === courtId);

  return generateHourlySlots(openFrom, openTo).map((time) => {
    const isBooked = courtBookings.some((b) =>
      bookingOverlapsSlot(b, dateIso, time)
    );
    const isPast =
      new Date(`${dateIso}T${time}:00`).getTime() < Date.now();

    let status: TimeSlot["status"] = "open";
    if (isBooked) status = "booked";
    else if (selectedTime === time) status = "selected";
    else if (isPast) status = "booked";

    return { time, status: isPast && !isBooked ? "booked" : status };
  });
}

export function slotToIsoRange(
  dateIso: string,
  slotTime: string
): { startAt: string; endAt: string } {
  const start = new Date(`${dateIso}T${slotTime}:00`);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return { startAt: start.toISOString(), endAt: end.toISOString() };
}

export function formatSlotLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatAmenity(label: string): string {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
