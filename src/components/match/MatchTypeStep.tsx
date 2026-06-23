import {
  UserIcon,
  UsersIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import type { MatchCategory, MatchType } from "@/types/match";
import { MATCH_CATEGORIES } from "./mockData";

interface MatchTypeStepProps {
  matchType: MatchType;
  matchCategory: MatchCategory;
  isPublic: boolean;
  onChange: (values: {
    matchType?: MatchType;
    matchCategory?: MatchCategory;
    isPublic?: boolean;
  }) => void;
}

const MATCH_TYPES: {
  value: MatchType;
  label: string;
  description: string;
  icon: typeof UserIcon;
}[] = [
  {
    value: "singles",
    label: "Singles",
    description: "1 vs 1",
    icon: UserIcon,
  },
  {
    value: "doubles",
    label: "Doubles",
    description: "2 vs 2",
    icon: UsersIcon,
  },
  {
    value: "mixed",
    label: "Mixed",
    description: "Mixed doubles",
    icon: HeartIcon,
  },
];

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
          "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function MatchTypeStep({
  matchType,
  matchCategory,
  isPublic,
  onChange,
}: MatchTypeStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Match type</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the format for this match.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {MATCH_TYPES.map(({ value, label, description, icon: Icon }) => {
          const active = matchType === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ matchType: value })}
              className={cn(
                "card-base flex flex-col items-center gap-2 p-4 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "hover:border-primary/40"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="font-semibold text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </button>
          );
        })}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Category</p>
        <div className="flex flex-wrap gap-2">
          {MATCH_CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              label={cat.label}
              active={matchCategory === cat.value}
              onClick={() => onChange({ matchCategory: cat.value })}
            />
          ))}
        </div>
        <div className="mt-3">
          <Badge variant="primary">{matchCategory}</Badge>
        </div>
      </div>

      <div className="card-base flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-medium text-foreground">Public match</p>
          <p className="text-sm text-muted-foreground">
            Visible on the live matches feed for spectators.
          </p>
        </div>
        <ToggleSwitch
          checked={isPublic}
          onChange={(next) => onChange({ isPublic: next })}
          label="Toggle public match visibility"
        />
      </div>
    </div>
  );
}
