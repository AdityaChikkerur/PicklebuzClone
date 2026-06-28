import type { MatchState } from "@/types/match";

interface MatchRuleChipsProps {
  matchState: MatchState;
}

export function MatchRuleChips({ matchState }: MatchRuleChipsProps) {
  const { matchType, targetPoints, winBy, bestOf, scoringType } = matchState;

  const chips = [
    matchType === "singles" ? "Singles" : matchType === "mixed" ? "Mixed" : "Doubles",
    `To ${targetPoints}`,
    `Win by ${winBy}`,
    `Best of ${bestOf}`,
    scoringType === "rally" ? "Rally" : "Side-out",
  ];

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
      {chips.map((chip) => (
        <span
          key={chip}
          className="shrink-0 rounded-full border border-border bg-arena-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}
