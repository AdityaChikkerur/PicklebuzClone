"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Chip } from "@/components/ui/Chip";

interface RankingsFiltersProps {
  search: string;
  city: string;
  skillLevel: string;
  cityOptions: readonly string[];
  skillOptions: readonly string[];
  onSearchChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSkillLevelChange: (value: string) => void;
  onClearFilters: () => void;
}

export function RankingsFilters({
  search,
  city,
  skillLevel,
  cityOptions,
  skillOptions,
  onSearchChange,
  onCityChange,
  onSkillLevelChange,
  onClearFilters,
}: RankingsFiltersProps) {
  const hasActiveFilters =
    search.trim().length > 0 || city !== "All" || skillLevel !== "All";

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search players…"
          className="input-base pl-10"
          aria-label="Search players"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          City
        </p>
        <div className="flex flex-wrap gap-2">
          {cityOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              active={city === option}
              onClick={() => onCityChange(option)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Skill level
        </p>
        <div className="flex flex-wrap gap-2">
          {skillOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              active={skillLevel === option}
              onClick={() => onSkillLevelChange(option)}
            />
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          Clear filters
        </button>
      )}
    </div>
  );
}
