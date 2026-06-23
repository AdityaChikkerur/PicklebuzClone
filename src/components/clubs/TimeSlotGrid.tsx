import { cn } from "@/lib/utils";
import { formatSlotLabel } from "@/lib/clubs/bookingUtils";
import type { TimeSlot } from "@/types/club";

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime?: string;
  onSelect: (time: string) => void;
  loading?: boolean;
}

export function TimeSlotGrid({
  slots,
  selectedTime,
  onSelect,
  loading = false,
}: TimeSlotGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-xl bg-muted"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No slots available for this day.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selectedTime === slot.time;
        const isBooked = slot.status === "booked";

        return (
          <button
            key={slot.time}
            type="button"
            disabled={isBooked}
            onClick={() => onSelect(slot.time)}
            className={cn(
              "rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all sm:text-sm",
              isBooked &&
                "cursor-not-allowed border-border bg-muted text-muted-foreground line-through",
              !isBooked &&
                !isSelected &&
                "border-border bg-card text-foreground hover:border-primary hover:bg-primary/5",
              isSelected &&
                "border-primary bg-primary text-primary-foreground shadow-sm"
            )}
            aria-pressed={isSelected}
            aria-disabled={isBooked}
          >
            {formatSlotLabel(slot.time)}
          </button>
        );
      })}
    </div>
  );
}
