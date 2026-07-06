import { MapPinIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import type { MatchSetupState } from "@/types/match";
import { QUICK_VENUES } from "./mockData";

const CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Nashik",
  "Nagpur",
  "Kolkata",
];

interface VenueStepProps {
  setup: MatchSetupState;
  onChange: (values: Partial<MatchSetupState>) => void;
}

function RefereeToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Toggle referee for this match"
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

export function VenueStep({ setup, onChange }: VenueStepProps) {
  const selectVenue = (name: string, city: string) => {
    onChange({ venue: name, city });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Venue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Where is this match being played?
        </p>
      </div>

      <div>
        <label htmlFor="venue-name" className="mb-1.5 block text-sm font-medium">
          Venue name
        </label>
        <input
          id="venue-name"
          type="text"
          value={setup.venue}
          onChange={(e) => onChange({ venue: e.target.value })}
          className="input-base"
          placeholder="e.g. Smash Arena"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Quick select</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_VENUES.map((v) => {
            const active = setup.venue === v.name && setup.city === v.city;
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
          <label htmlFor="court-number" className="mb-1.5 block text-sm font-medium">
            Court number
          </label>
          <input
            id="court-number"
            type="text"
            value={setup.courtNumber}
            onChange={(e) => onChange({ courtNumber: e.target.value })}
            className="input-base"
            placeholder="e.g. Court 3"
          />
        </div>

        <div>
          <label htmlFor="venue-city" className="mb-1.5 block text-sm font-medium">
            City
          </label>
          <input
            id="venue-city"
            type="text"
            list="venue-cities"
            value={setup.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="input-base"
            placeholder="e.g. Bengaluru"
          />
          <datalist id="venue-cities">
            {CITIES.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="card-base flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-medium text-foreground">Referee assigned</p>
          <p className="text-sm text-muted-foreground">
            A referee will officiate and verify the result.
          </p>
        </div>
        <RefereeToggle
          checked={setup.hasReferee}
          onChange={(hasReferee) => onChange({ hasReferee })}
        />
      </div>
    </div>
  );
}
