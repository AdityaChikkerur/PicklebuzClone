"use client";

import { cn } from "@/lib/utils";
import type { TournamentFormat, TournamentTab } from "@/types/tournament";

interface TabOption {
  id: TournamentTab;
  label: string;
}

interface TournamentTabBarProps {
  active: TournamentTab;
  format: TournamentFormat | undefined;
  isOrganizer: boolean;
  onChange: (tab: TournamentTab) => void;
}

function getTabs(format: TournamentFormat | undefined, isOrganizer: boolean): TabOption[] {
  const tabs: TabOption[] = [
    { id: "overview", label: "Overview" },
    { id: "fixtures", label: "Fixtures" },
  ];

  if (format === "knockout" || format === "group_knockout") {
    tabs.push({ id: "bracket", label: "Bracket" });
  }
  if (format === "round_robin" || format === "league" || format === "group_knockout") {
    tabs.push({ id: "points", label: "Points" });
  }

  tabs.push({ id: "participants", label: isOrganizer ? "Manage" : "Players" });
  tabs.push({ id: "live", label: "Live" });
  tabs.push({ id: "results", label: "Results" });

  return tabs;
}

export function TournamentTabBar({
  active,
  format,
  isOrganizer,
  onChange,
}: TournamentTabBarProps) {
  const tabs = getTabs(format, isOrganizer);

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
