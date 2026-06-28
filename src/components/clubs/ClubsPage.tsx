"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { AppLayout } from "@/components/layout";
import { Chip } from "@/components/ui/Chip";
import { useClubs } from "@/hooks/useClubs";
import { ClubCard } from "./ClubCard";

export function ClubsPage() {
  const { clubs, loading, error } = useClubs();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All");

  const cities = useMemo(() => {
    const unique = [...new Set(clubs.map((c) => c.city))].sort();
    return ["All", ...unique];
  }, [clubs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clubs.filter((c) => {
      if (city !== "All" && c.city !== city) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.amenities.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [clubs, search, city]);

  return (
    <AppLayout title="Clubs">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 md:gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Discover</p>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Pickleball clubs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find courts near you and book a slot in minutes.
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
            placeholder="Search clubs, cities, amenities…"
            className="input-base pl-10"
            aria-label="Search clubs"
          />
        </div>

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

        {error && (
          <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}. Showing demo clubs.
          </p>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="card-base h-44 animate-pulse bg-muted/50"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-base px-6 py-12 text-center">
            <p className="font-semibold text-foreground">No clubs found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different city or clear your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCity("All");
              }}
              className="btn-outline mt-4 text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
