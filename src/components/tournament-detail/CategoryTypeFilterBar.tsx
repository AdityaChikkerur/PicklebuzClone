"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CATEGORY_TYPE_LABELS, type CategoryTypeFilter } from "@/types/tournament";

interface CategoryTypeFilterBarProps {
  value: CategoryTypeFilter;
  onChange: (value: CategoryTypeFilter) => void;
  counts?: Partial<Record<CategoryTypeFilter, number>>;
}

const OPTIONS: { id: CategoryTypeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "singles", label: CATEGORY_TYPE_LABELS.singles },
  { id: "doubles", label: CATEGORY_TYPE_LABELS.doubles },
  { id: "mixed", label: CATEGORY_TYPE_LABELS.mixed },
];

export function CategoryTypeFilterBar({
  value,
  onChange,
  counts,
}: CategoryTypeFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-lg px-3 py-1 text-xs font-semibold ${
            value === opt.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
          {counts?.[opt.id] != null ? ` (${counts[opt.id]})` : ""}
        </button>
      ))}
    </div>
  );
}

interface ScheduleFixtureDialogProps {
  open: boolean;
  teamLabel: string;
  initialCourt?: string;
  initialScheduledAt?: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (scheduledAt: string, court: string) => Promise<void>;
}

export function ScheduleFixtureDialog({
  open,
  teamLabel,
  initialCourt = "",
  initialScheduledAt,
  saving = false,
  onClose,
  onSave,
}: ScheduleFixtureDialogProps) {
  const defaultDate = initialScheduledAt
    ? new Date(initialScheduledAt).toISOString().slice(0, 16)
    : "";

  const [scheduledAt, setScheduledAt] = useState(defaultDate);
  const [court, setCourt] = useState(initialCourt);

  useEffect(() => {
    if (open) {
      setScheduledAt(defaultDate);
      setCourt(initialCourt);
    }
  }, [open, defaultDate, initialCourt]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error("Pick a date and time");
      return;
    }
    await onSave(new Date(scheduledAt).toISOString(), court.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="card-base w-full max-w-md p-5 shadow-xl"
        role="dialog"
        aria-labelledby="schedule-fixture-title"
      >
        <h3 id="schedule-fixture-title" className="text-base font-bold text-foreground">
          Schedule match
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{teamLabel}</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="fixture-scheduled-at" className="mb-1.5 block text-sm font-medium">
              Date & time
            </label>
            <input
              id="fixture-scheduled-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input-base w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="fixture-court" className="mb-1.5 block text-sm font-medium">
              Court
            </label>
            <input
              id="fixture-court"
              type="text"
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              placeholder="e.g. Court 1"
              className="input-base w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-outline text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? "Saving…" : "Save schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
