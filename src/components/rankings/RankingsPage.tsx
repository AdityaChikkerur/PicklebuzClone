"use client";

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { useRankings } from "@/hooks/useRankings";
import { CategoryTabs } from "./CategoryTabs";
import { RANKING_CITIES, SKILL_FILTER_OPTIONS } from "./mockData";
import { Podium } from "./Podium";
import { RankingsEmptyState } from "./RankingsEmptyState";
import { RankingsFilters } from "./RankingsFilters";
import { RankingsTable } from "./RankingsTable";
import type { RankingCategory } from "./types";
import { filterPlayers, rankPlayers } from "./utils";

export function RankingsPage() {
  const { players, loading, error, source } = useRankings();
  const [category, setCategory] = useState<RankingCategory>("singles");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All");
  const [skillLevel, setSkillLevel] = useState("All");

  const cityOptions = useMemo(() => {
    if (source === "mock") return [...RANKING_CITIES];
    const fromData = [...new Set(players.map((p) => p.city).filter(Boolean))].sort();
    return ["All", ...fromData];
  }, [players, source]);

  const clearFilters = () => {
    setSearch("");
    setCity("All");
    setSkillLevel("All");
  };

  const rankedPlayers = useMemo(() => {
    const filtered = filterPlayers(players, search, city, skillLevel);
    return rankPlayers(filtered, category);
  }, [players, search, city, skillLevel, category]);

  const showPodium = rankedPlayers.length >= 3;

  return (
    <AppLayout title="Rankings">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 md:gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Leaderboard</p>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Player rankings
          </h2>
          {source === "supabase" && (
            <p className="mt-1 text-xs text-muted-foreground">
              Verified and completed matches only
            </p>
          )}
        </div>

        <CategoryTabs active={category} onChange={setCategory} />

        <RankingsFilters
          search={search}
          city={city}
          skillLevel={skillLevel}
          cityOptions={cityOptions}
          skillOptions={SKILL_FILTER_OPTIONS}
          onSearchChange={setSearch}
          onCityChange={setCity}
          onSkillLevelChange={setSkillLevel}
          onClearFilters={clearFilters}
        />

        {loading ? (
          <div className="card-base px-6 py-12 text-center text-sm text-muted-foreground">
            Loading rankings…
          </div>
        ) : error ? (
          <div className="card-base px-6 py-12 text-center text-sm text-danger">
            {error}
          </div>
        ) : rankedPlayers.length === 0 ? (
          <RankingsEmptyState onClearFilters={clearFilters} />
        ) : (
          <>
            {showPodium && <Podium players={rankedPlayers} category={category} />}
            <RankingsTable players={rankedPlayers} category={category} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
