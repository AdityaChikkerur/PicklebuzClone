"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import {
  buildTimeSlots,
  formatSlotLabel,
  slotToIsoRange,
} from "@/lib/clubs/bookingUtils";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { PaymentPlaceholderPanel } from "@/components/monetization";
import { useAuthStore } from "@/store/authStore";
import { usePayments } from "@/hooks/usePayments";
import { useBookings } from "@/hooks/useBookings";
import { useClubDetail } from "@/hooks/useClubs";
import { useCourtAvailability } from "@/hooks/useCourtAvailability";
import type { Court } from "@/types/club";
import { CourtsList } from "./CourtsList";
import { TimeSlotGrid } from "./TimeSlotGrid";

interface BookingPageProps {
  clubId: string;
}

type Step = "court" | "datetime" | "confirm" | "done";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function maxBookDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export function BookingPage({ clubId }: BookingPageProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const { recordPayment } = usePayments(userId);
  const { club, courts, loading } = useClubDetail(clubId);
  const { createBooking } = useBookings();

  const [step, setStep] = useState<Step>("court");
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [date, setDate] = useState(todayIso());
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { bookings, loading: slotsLoading } = useCourtAvailability(
    clubId,
    date,
    courts
  );

  const slots = useMemo(() => {
    if (!selectedCourt) return [];
    return buildTimeSlots(
      selectedCourt.openFrom,
      selectedCourt.openTo,
      date,
      selectedCourt.id,
      bookings,
      selectedTime
    );
  }, [selectedCourt, date, bookings, selectedTime]);

  const amount = selectedCourt?.pricePerHour ?? 0;

  if (loading) {
    return (
      <AppLayout title="Book court">
        <div className="mx-auto max-w-lg animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      </AppLayout>
    );
  }

  if (!club) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-lg py-16 text-center">
          <p className="font-semibold">Club not found</p>
          <Link href="/clubs" className="btn-primary mt-4 inline-block">
            Browse clubs
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleConfirm = async () => {
    if (!user) {
      toast.error("Please sign in to book a court");
      router.push("/auth");
      return;
    }
    if (!selectedCourt || !selectedTime) return;

    setSubmitting(true);
    const { startAt, endAt } = slotToIsoRange(date, selectedTime);

    try {
      const booking = await createBooking({
        courtId: selectedCourt.id,
        startAt,
        endAt,
        amount,
      });

      if (booking) {
        if (amount > 0) {
          await recordPayment({
            kind: "court_booking",
            refId: booking.id,
            amount,
            status: "pending",
            successMessage: "Booking request submitted (payment pending)",
          });
        } else {
          toast.success("Booking request submitted!");
        }
        setStep("done");
      } else {
        toast.error("Could not create booking. Try again.");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Book court">
      <div className="mx-auto flex max-w-lg flex-col gap-5">
        <button
          type="button"
          onClick={() => {
            if (step === "datetime") setStep("court");
            else if (step === "confirm") setStep("datetime");
            else router.back();
          }}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        <div>
          <p className="text-sm text-muted-foreground">{club.name}</p>
          <h2 className="text-xl font-bold text-foreground">Book a court</h2>
        </div>

        <ol className="flex gap-2 text-xs font-semibold">
          {(["court", "datetime", "confirm"] as const).map((s, i) => (
            <li
              key={s}
              className={cn(
                "flex-1 rounded-lg px-2 py-1.5 text-center capitalize",
                step === s || (step === "done" && s === "confirm")
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}. {s === "datetime" ? "Date & time" : s}
            </li>
          ))}
        </ol>

        {step === "court" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a court</p>
            <CourtsList
              courts={courts}
              selectable
              selectedCourtId={selectedCourt?.id}
              onSelect={(court) => {
                setSelectedCourt(court);
                setSelectedTime(undefined);
                setStep("datetime");
              }}
            />
          </div>
        )}

        {step === "datetime" && selectedCourt && (
          <div className="space-y-4">
            <div className="card-base p-4">
              <p className="font-semibold text-foreground">{selectedCourt.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(selectedCourt.pricePerHour)} per hour
              </p>
            </div>

            <div>
              <label htmlFor="booking-date" className="mb-1.5 block text-sm font-medium">
                Date
              </label>
              <input
                id="booking-date"
                type="date"
                min={todayIso()}
                max={maxBookDate()}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedTime(undefined);
                }}
                className="input-base"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Time slot</p>
              <TimeSlotGrid
                slots={slots}
                selectedTime={selectedTime}
                onSelect={setSelectedTime}
                loading={slotsLoading}
              />
            </div>

            <button
              type="button"
              disabled={!selectedTime}
              onClick={() => setStep("confirm")}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </div>
        )}

        {step === "confirm" && selectedCourt && selectedTime && (
          <div className="space-y-4">
            <div className="card-base space-y-3 p-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Club</span>
                <span className="font-medium text-foreground">{club.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Court</span>
                <span className="font-medium text-foreground">
                  {selectedCourt.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">
                  {formatDate(date)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">
                  {formatSlotLabel(selectedTime)} (1 hr)
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-primary">
                  {formatCurrency(amount)}
                </span>
              </div>
              <Badge variant="warning">Pay at venue · pending confirmation</Badge>
            </div>

            <PaymentPlaceholderPanel
              amount={amount}
              label="Court booking fee"
              description="Pay at venue for now. A pending court_booking row is recorded when you confirm."
            />

            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleConfirm()}
              className="btn-primary w-full"
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="card-base flex flex-col items-center gap-4 px-6 py-10 text-center">
            <CheckCircleIcon className="h-14 w-14 text-success" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Booking submitted</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The club will confirm your slot shortly. Pay at the venue.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Link href={`/club/${clubId}`} className="btn-outline flex-1 text-center">
                Back to club
              </Link>
              <Link href="/clubs" className="btn-primary flex-1 text-center">
                Browse clubs
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
