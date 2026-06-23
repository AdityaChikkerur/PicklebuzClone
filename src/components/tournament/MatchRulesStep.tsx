"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import type { ScoringType } from "@/types/match";
import type { TournamentForm } from "@/types/tournament";

interface MatchRulesStepProps {
  form: TournamentForm;
  onChange: (values: Partial<TournamentForm>) => void;
}

const POINT_PRESETS = [11, 15, 21] as const;
const BEST_OF_OPTIONS = [1, 3, 5] as const;
const WIN_BY_OPTIONS = [1, 2] as const;
const TIMEOUT_COUNTS = [0, 1, 2, 3] as const;
const TIMEOUT_DURATIONS = [30, 60, 90, 120] as const;

export function MatchRulesStep({ form, onChange }: MatchRulesStepProps) {
  const [customPoints, setCustomPoints] = useState(
    !POINT_PRESETS.includes(form.pointsToWin as (typeof POINT_PRESETS)[number])
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Match rules</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Default scoring rules for all matches in this tournament.
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Scoring system</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "rally" as ScoringType, label: "Rally", desc: "Every rally scores" },
              { value: "side-out" as ScoringType, label: "Side-out", desc: "Serve to score" },
            ] as const
          ).map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ scoringType: value })}
              className={cn(
                "card-base p-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                form.scoringType === value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "hover:border-primary/40"
              )}
            >
              <p className="font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Points to win (per game)</p>
        <div className="flex flex-wrap gap-2">
          {POINT_PRESETS.map((pts) => (
            <Chip
              key={pts}
              label={String(pts)}
              active={!customPoints && form.pointsToWin === pts}
              onClick={() => {
                setCustomPoints(false);
                onChange({ pointsToWin: pts });
              }}
            />
          ))}
          <Chip
            label="Custom"
            active={customPoints}
            onClick={() => setCustomPoints(true)}
          />
        </div>
        {customPoints && (
          <div className="mt-3">
            <input
              type="number"
              min={1}
              max={99}
              value={form.pointsToWin}
              onChange={(e) =>
                onChange({ pointsToWin: Number(e.target.value) || 1 })
              }
              className="input-base max-w-[8rem]"
              aria-label="Custom points to win"
            />
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Best of</p>
        <div className="flex flex-wrap gap-2">
          {BEST_OF_OPTIONS.map((n) => (
            <Chip
              key={n}
              label={n === 1 ? "Single game" : `Best of ${n}`}
              active={form.bestOf === n}
              onClick={() => onChange({ bestOf: n })}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Win margin</p>
        <div className="flex flex-wrap gap-2">
          {WIN_BY_OPTIONS.map((n) => (
            <Chip
              key={n}
              label={`Win by ${n}`}
              active={form.winBy === n}
              onClick={() => onChange({ winBy: n })}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Timeouts per team</p>
          <div className="flex flex-wrap gap-2">
            {TIMEOUT_COUNTS.map((n) => (
              <Chip
                key={n}
                label={String(n)}
                active={form.maxTimeouts === n}
                onClick={() => onChange({ maxTimeouts: n })}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Timeout duration</p>
          <div className="flex flex-wrap gap-2">
            {TIMEOUT_DURATIONS.map((sec) => (
              <Chip
                key={sec}
                label={`${sec}s`}
                active={form.timeoutDuration === sec}
                onClick={() => onChange({ timeoutDuration: sec })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
