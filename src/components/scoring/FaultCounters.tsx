import type { MatchState } from "@/types/match";
import { FAULT_LABELS } from "./faultLabels";

interface FaultCountersProps {
  matchState: MatchState;
}

export function FaultCounters({ matchState }: FaultCountersProps) {
  const { faultsA, faultsB, teamAName, teamBName } = matchState;
  const faultTypes = Object.keys(FAULT_LABELS) as (keyof typeof FAULT_LABELS)[];

  const totalA = faultTypes.reduce((sum, key) => sum + faultsA[key], 0);
  const totalB = faultTypes.reduce((sum, key) => sum + faultsB[key], 0);

  if (totalA === 0 && totalB === 0) return null;

  return (
    <div className="border-t border-arena-border px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Faults
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="pb-1 text-left font-medium">Type</th>
              <th className="pb-1 text-center font-medium text-primary">
                {teamAName}
              </th>
              <th className="pb-1 text-center font-medium text-foreground">
                {teamBName}
              </th>
            </tr>
          </thead>
          <tbody>
            {faultTypes.map((type) => (
              <tr key={type} className="border-t border-arena-border text-muted-foreground">
                <td className="py-1.5">{FAULT_LABELS[type]}</td>
                <td className="py-1.5 text-center font-semibold text-foreground">{faultsA[type]}</td>
                <td className="py-1.5 text-center font-semibold text-foreground">{faultsB[type]}</td>
              </tr>
            ))}
            <tr className="border-t border-border font-semibold text-foreground">
              <td className="py-1.5">Total</td>
              <td className="py-1.5 text-center">{totalA}</td>
              <td className="py-1.5 text-center">{totalB}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
