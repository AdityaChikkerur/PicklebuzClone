import type { MatchStats } from "@/types/match";
import { FAULT_LABELS } from "@/components/scoring/faultLabels";
import type { FaultType } from "@/types/match";
import { cn } from "@/lib/utils";

interface MatchStatsTilesProps {
  stats: MatchStats;
  teamAName: string;
  teamBName: string;
  className?: string;
}

function faultTotal(faults: Record<FaultType, number>): number {
  return Object.values(faults).reduce((s, n) => s + n, 0);
}

export function MatchStatsTiles({
  stats,
  teamAName,
  teamBName,
  className,
}: MatchStatsTilesProps) {
  const tiles = [
    { label: "Points won", value: `${stats.pointsWonA} / ${stats.pointsWonB}`, sub: `${teamAName} / ${teamBName}` },
    { label: "Faults", value: `${faultTotal(stats.faultsA)} / ${faultTotal(stats.faultsB)}`, sub: "Total per team" },
    { label: "Timeouts", value: `${stats.timeoutsUsedA} / ${stats.timeoutsUsedB}`, sub: "Used" },
    { label: "Duration", value: `${stats.durationMinutes} min`, sub: "Match time" },
  ];

  const topFaultA = Object.entries(stats.faultsA).sort((a, b) => b[1] - a[1])[0];
  const topFaultB = Object.entries(stats.faultsB).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="card-base p-4">
            <p className="text-xs text-muted-foreground">{tile.label}</p>
            <p className="mt-1 text-lg font-bold text-foreground">{tile.value}</p>
            <p className="text-xs text-muted-foreground">{tile.sub}</p>
          </div>
        ))}
      </div>

      <div className="card-base p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Faults by type</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{teamAName}</p>
            <ul className="space-y-1 text-sm">
              {(Object.keys(stats.faultsA) as FaultType[]).map((key) => (
                <li key={key} className="flex justify-between">
                  <span>{FAULT_LABELS[key]}</span>
                  <span className="font-semibold">{stats.faultsA[key]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{teamBName}</p>
            <ul className="space-y-1 text-sm">
              {(Object.keys(stats.faultsB) as FaultType[]).map((key) => (
                <li key={key} className="flex justify-between">
                  <span>{FAULT_LABELS[key]}</span>
                  <span className="font-semibold">{stats.faultsB[key]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {(topFaultA[1] > 0 || topFaultB[1] > 0) && (
          <p className="mt-3 text-xs text-muted-foreground">
            Most common: {FAULT_LABELS[topFaultA[0] as FaultType]} ({teamAName}),{" "}
            {FAULT_LABELS[topFaultB[0] as FaultType]} ({teamBName})
          </p>
        )}
      </div>
    </div>
  );
}
