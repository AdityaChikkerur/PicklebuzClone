"use client";

import { MapPinIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { QUICK_VENUES } from "@/components/match/mockData";
import type { TournamentForm } from "@/types/tournament";

const CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
];

interface BasicsStepProps {
  form: TournamentForm;
  onChange: (values: Partial<TournamentForm>) => void;
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function BasicsStep({ form, onChange }: BasicsStepProps) {
  const selectVenue = (name: string, city: string) => {
    onChange({ venue: name, city });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Tournament basics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Name, venue, dates, and visibility for your event.
        </p>
      </div>

      <div>
        <label htmlFor="tournament-name" className="mb-1.5 block text-sm font-medium">
          Tournament name
        </label>
        <input
          id="tournament-name"
          type="text"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="input-base"
          placeholder="e.g. Bangalore Open 2026"
        />
      </div>

      <div>
        <label htmlFor="tournament-description" className="mb-1.5 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="tournament-description"
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="input-base resize-none"
          placeholder="Prize pool, format notes, what players should bring…"
        />
      </div>

      <div className="card-base flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-medium text-foreground">Public tournament</p>
          <p className="text-sm text-muted-foreground">
            Listed on the app for players to discover and register.
          </p>
        </div>
        <ToggleSwitch
          checked={form.isPublic}
          onChange={(isPublic) => onChange({ isPublic })}
          label="Toggle public tournament visibility"
        />
      </div>

      <div>
        <label htmlFor="tournament-venue" className="mb-1.5 block text-sm font-medium">
          Venue
        </label>
        <input
          id="tournament-venue"
          type="text"
          value={form.venue}
          onChange={(e) => onChange({ venue: e.target.value })}
          className="input-base"
          placeholder="e.g. Smash Arena"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Quick select venue</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_VENUES.map((v) => {
            const active = form.venue === v.name && form.city === v.city;
            return (
              <button
                key={`${v.name}-${v.city}`}
                type="button"
                onClick={() => selectVenue(v.name, v.city)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground hover:border-primary/40"
                )}
              >
                <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {v.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tournament-city" className="mb-1.5 block text-sm font-medium">
            City
          </label>
          <input
            id="tournament-city"
            type="text"
            list="tournament-cities"
            value={form.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="input-base"
            placeholder="e.g. Bangalore"
          />
          <datalist id="tournament-cities">
            {CITIES.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="tournament-address" className="mb-1.5 block text-sm font-medium">
            Address
          </label>
          <input
            id="tournament-address"
            type="text"
            value={form.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className="input-base"
            placeholder="Street, area, pin code"
          />
        </div>
      </div>

      <div>
        <label htmlFor="max-participants" className="mb-1.5 block text-sm font-medium">
          Max participants
        </label>
        <input
          id="max-participants"
          type="number"
          min={4}
          max={512}
          value={form.maxParticipants}
          onChange={(e) =>
            onChange({ maxParticipants: Number(e.target.value) || 4 })
          }
          className="input-base max-w-[10rem]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="start-date" className="mb-1.5 block text-sm font-medium">
            Start date
          </label>
          <input
            id="start-date"
            type="date"
            value={form.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="input-base"
          />
        </div>

        <div>
          <label htmlFor="end-date" className="mb-1.5 block text-sm font-medium">
            End date
          </label>
          <input
            id="end-date"
            type="date"
            value={form.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="input-base"
          />
        </div>

        <div>
          <label htmlFor="registration-deadline" className="mb-1.5 block text-sm font-medium">
            Registration deadline
          </label>
          <input
            id="registration-deadline"
            type="date"
            value={form.registrationDeadline}
            onChange={(e) => onChange({ registrationDeadline: e.target.value })}
            className="input-base"
          />
        </div>
      </div>
    </div>
  );
}
