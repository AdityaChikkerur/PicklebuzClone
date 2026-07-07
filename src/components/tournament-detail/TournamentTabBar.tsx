"use client";

import { cn } from "@/lib/utils";
import type { TournamentTab } from "@/types/tournament";

interface TabOption {
  id: TournamentTab;
  label: string;
}

interface TournamentTabBarProps {
  active: TournamentTab;
  onChange: (tab: TournamentTab) => void;
}

function getTabs(): TabOption[] {
  return [
    { id: "overview", label: "Overview" },
    { id: "points", label: "Points" },
    { id: "live", label: "Live" },
    { id: "results", label: "Results" },
  ];
}

export function TournamentTabBar({
  active,
  onChange,
}: TournamentTabBarProps) {
  const tabs = getTabs();

  return (
    <div className="card-base overflow-hidden">
      <div
        className="flex gap-1 overflow-x-auto p-1 scrollbar-none"
        role="tablist"
        aria-label="Tournament sections"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
              active === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}