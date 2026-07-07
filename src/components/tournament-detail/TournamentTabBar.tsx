"use client";

import { cn } from "@/lib/utils";
import { hasKnockoutBracket } from "@/lib/tournament/bracketUtils";
import type { TournamentFormat, TournamentTab } from "@/types/tournament";

interface TabOption {
  id: TournamentTab;
  label: string;
  organizerOnly?: boolean;
}

interface TournamentTabBarProps {
  active: TournamentTab;
  onChange: (tab: TournamentTab) => void;
  isOrganizer?: boolean;
  format?: TournamentFormat;
}

function getTabs(isOrganizer: boolean, format?: TournamentFormat): TabOption[] {
  const tabs: TabOption[] = [
    { id: "overview", label: "Overview" },
    { id: "fixtures", label: "Fixtures" },
  ];

  if (hasKnockoutBracket(format)) {
    tabs.push({ id: "bracket", label: "Bracket" });
  }

  tabs.push(
    { id: "points", label: "Standings" },
    { id: "live", label: "Live" },
    { id: "results", label: "Results" }
  );

  if (isOrganizer) {
    tabs.push({ id: "participants", label: "Manage", organizerOnly: true });
  }

  return tabs;
}

export function TournamentTabBar({
  active,
  onChange,
  isOrganizer = false,
  format,
}: TournamentTabBarProps) {
  const tabs = getTabs(isOrganizer, format);

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
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              tab.organizerOnly &&
                active !== tab.id &&
                "border border-secondary/20"
            )}
          >
            {tab.label}
            {tab.organizerOnly && (
              <span className="ml-1.5 hidden text-[10px] font-bold uppercase tracking-wide opacity-70 sm:inline">
                · Org
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export const TAB_PARAM_ALIASES: Record<string, TournamentTab> = {
  manage: "participants",
};

export const VALID_TOURNAMENT_TABS: TournamentTab[] = [
  "overview",
  "fixtures",
  "bracket",
  "points",
  "participants",
  "live",
  "results",
];

export function parseTournamentTabParam(
  value: string | null,
  isOrganizer: boolean,
  format?: TournamentFormat
): TournamentTab | null {
  if (!value) return null;

  const resolved = TAB_PARAM_ALIASES[value] ?? value;
  if (!VALID_TOURNAMENT_TABS.includes(resolved as TournamentTab)) {
    return null;
  }

  const tab = resolved as TournamentTab;

  if (tab === "participants" && !isOrganizer) return null;
  if (tab === "bracket" && !hasKnockoutBracket(format)) return null;

  return tab;
}
