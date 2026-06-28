"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AppLayout } from "@/components/layout";
import { Chip } from "@/components/ui/Chip";
import { useDiscoverPlayers, type DiscoverIntent } from "@/hooks/useDiscoverPlayers";
import { DISCOVERY_PLAYERS } from "@/lib/mock/extendedMockData";
import { SKILL_LEVELS } from "@/types/player";
import { PlayerCard } from "./PlayerCard";

const INTENT_OPTIONS = [
  { value: "all" as const, label: "All players" },
  { value: "following" as const, label: "Following" },
  { value: "partner" as const, label: "Need partner" },
  { value: "match" as const, label: "Open match" },
  { value: "both" as const, label: "Both" },
];

export function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All");
  const [skillLevel, setSkillLevel] = useState("All");
  const [intent, setIntent] = useState<DiscoverIntent>("all");

  const filters = useMemo(
    () => ({ search, city, skillLevel, intent }),
    [search, city, skillLevel, intent]
  );

  const { players, loading, error } = useDiscoverPlayers(filters);

  const cities = useMemo(() => {
    const unique = [...new Set(DISCOVERY_PLAYERS.map((p) => p.city))].sort();
    return ["All", ...unique];
  }, []);

  const hasActiveFilters =
    search.trim().length > 0 ||
    city !== "All" ||
    skillLevel !== "All" ||
    intent !== "all";

  const clearFilters = () => {
    setSearch("");
    setCity("All");
    setSkillLevel("All");
    setIntent("all");
  };

  return (
    <AppLayout title="Discover">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 md:gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Community</p>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Find players
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse players by city and skill. Invite partners or set up a
            friendly match.
          </p>
        </div>

        <div className="relative">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or city…"
            className="input-base pl-10"
            aria-label="Search players"
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Looking for
          </p>
          <div className="flex flex-wrap gap-2">
            {INTENT_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                active={intent === option.value}
                onClick={() => setIntent(option.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            City
          </p>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <Chip
                key={c}
                label={c}
                active={city === c}
                onClick={() => setCity(c)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Skill level
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip
              label="All"
              active={skillLevel === "All"}
              onClick={() => setSkillLevel("All")}
            />
            {SKILL_LEVELS.map((level) => (
              <Chip
                key={level}
                label={level}
                active={skillLevel === level}
                onClick={() => setSkillLevel(level)}
              />
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </button>
        )}

        {error && (
          <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}. Showing demo players.
          </p>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="card-base h-52 animate-pulse bg-muted/50"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : players.length === 0 ? (
          <div className="card-base px-6 py-12 text-center">
            <p className="font-semibold text-foreground">No players found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try widening your filters or search another city.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="btn-outline mt-4 text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
