"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/lib/utils";
import type { Court } from "@/types/club";

export interface CourtFormState {
  name: string;
  surface: string;
  pricePerHour: number;
  openFrom: string;
  openTo: string;
}

const SURFACE_OPTIONS = [
  "Acrylic hard",
  "Concrete",
  "Indoor wood",
  "Outdoor composite",
];

const INITIAL_FORM: CourtFormState = {
  name: "",
  surface: SURFACE_OPTIONS[0],
  pricePerHour: 400,
  openFrom: "06:00",
  openTo: "22:00",
};

interface CourtWizardProps {
  open: boolean;
  clubName: string;
  court?: Court | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (form: CourtFormState) => void;
}

function formFromCourt(court: Court): CourtFormState {
  return {
    name: court.name,
    surface: court.surface || SURFACE_OPTIONS[0],
    pricePerHour: court.pricePerHour,
    openFrom: court.openFrom.slice(0, 5),
    openTo: court.openTo.slice(0, 5),
  };
}

export function CourtWizard({
  open,
  clubName,
  court,
  saving = false,
  onClose,
  onSave,
}: CourtWizardProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CourtFormState>(INITIAL_FORM);

  const isEdit = Boolean(court);
  const totalSteps = 3;

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setForm(court ? formFromCourt(court) : INITIAL_FORM);
  }, [open, court]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const canAdvance =
    step === 1
      ? form.name.trim().length > 0
      : step === 2
        ? form.pricePerHour > 0 && form.openFrom < form.openTo
        : true;

  const handleNext = () => {
    if (step < totalSteps && canAdvance) setStep((s) => s + 1);
    if (step === totalSteps) onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close court wizard"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="court-wizard-title"
        className="relative z-10 w-full max-w-lg rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {clubName} · Step {step} of {totalSteps}
            </p>
            <h2
              id="court-wizard-title"
              className="text-lg font-bold text-foreground"
            >
              {isEdit ? "Edit court" : "Add court"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Court name
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Court 1"
                className="input-base mt-1 w-full"
                autoFocus
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Surface
              </span>
              <select
                value={form.surface}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, surface: e.target.value }))
                }
                className="input-base mt-1 w-full"
              >
                {SURFACE_OPTIONS.map((surface) => (
                  <option key={surface} value={surface}>
                    {surface}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Price per hour (₹)
              </span>
              <input
                type="number"
                min={0}
                step={50}
                value={form.pricePerHour}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    pricePerHour: Number(e.target.value) || 0,
                  }))
                }
                className="input-base mt-1 w-full"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-foreground">
                  Opens
                </span>
                <input
                  type="time"
                  value={form.openFrom}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, openFrom: e.target.value }))
                  }
                  className="input-base mt-1 w-full"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground">
                  Closes
                </span>
                <input
                  type="time"
                  value={form.openTo}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, openTo: e.target.value }))
                  }
                  className="input-base mt-1 w-full"
                />
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card-base space-y-2 p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              <span className="font-medium text-foreground">{form.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Surface:</span>{" "}
              <span className="font-medium text-foreground">{form.surface}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Rate:</span>{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(form.pricePerHour)}/hr
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Hours:</span>{" "}
              <span className="font-medium text-foreground">
                {form.openFrom} – {form.openTo}
              </span>
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-outline flex-1"
              disabled={saving}
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1"
              disabled={saving}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance || saving}
            className="btn-primary flex-1"
          >
            {saving
              ? "Saving…"
              : step === totalSteps
                ? isEdit
                  ? "Save changes"
                  : "Add court"
                : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
