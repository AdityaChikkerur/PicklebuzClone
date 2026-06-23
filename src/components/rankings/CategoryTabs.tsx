"use client";

import { cn } from "@/lib/utils";
import { RANKING_CATEGORY_LABELS, type RankingCategory } from "./types";

const CATEGORIES: RankingCategory[] = [
  "singles",
  "doubles",
  "winpct",
  "streaks",
  "strength",
];

interface CategoryTabsProps {
  active: RankingCategory;
  onChange: (category: RankingCategory) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Leaderboard category"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      {CATEGORIES.map((category) => {
        const isActive = active === category;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(category)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {RANKING_CATEGORY_LABELS[category]}
          </button>
        );
      })}
    </div>
  );
}
