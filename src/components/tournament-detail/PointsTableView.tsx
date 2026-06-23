"use client";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { PointsTableRow } from "@/types/tournament";

interface PointsTableViewProps {
  rows: PointsTableRow[];
}

export function PointsTableView({ rows }: PointsTableViewProps) {
  if (rows.length === 0) {
    return (
      <div className="card-base p-8 text-center">
        <p className="text-sm font-medium text-foreground">No standings yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Points table updates as round-robin matches are completed.
        </p>
      </div>
    );
  }

  const sorted = [...rows].sort((a, b) => a.ranking - b.ranking);

  return (
    <div className="card-base overflow-hidden">
      <div className="hidden border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[3rem_1fr_repeat(5,3.5rem)] sm:gap-2">
        <span>#</span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">L</span>
        <span className="text-center">PF</span>
        <span className="text-center">PD</span>
      </div>

      <ul className="divide-y divide-border">
        {sorted.map((row) => (
          <li
            key={row.id}
            className={cn(
              "px-4 py-3",
              row.ranking === 1 && "border-l-4 border-warning bg-warning/5"
            )}
          >
            <div className="grid items-center gap-2 sm:grid-cols-[3rem_1fr_repeat(5,3.5rem)] sm:gap-2">
              <span className="flex items-center gap-1 text-sm font-bold tabular-nums text-foreground">
                {row.ranking}
                {row.ranking === 1 && (
                  <Badge variant="warning" className="hidden text-[10px] sm:inline-flex">
                    1st
                  </Badge>
                )}
              </span>
              <span className="text-sm font-semibold text-foreground">{row.teamName}</span>
              <span className="text-center text-sm tabular-nums text-muted-foreground sm:block">
                {row.played}
              </span>
              <span className="text-center text-sm font-semibold tabular-nums text-success sm:block">
                {row.wins}
              </span>
              <span className="text-center text-sm tabular-nums text-danger sm:block">
                {row.losses}
              </span>
              <span className="text-center text-sm tabular-nums text-muted-foreground sm:block">
                {row.pointsFor}
              </span>
              <span
                className={cn(
                  "text-center text-sm font-bold tabular-nums sm:block",
                  row.pointDifference > 0
                    ? "text-success"
                    : row.pointDifference < 0
                      ? "text-danger"
                      : "text-muted-foreground"
                )}
              >
                {row.pointDifference > 0 ? "+" : ""}
                {row.pointDifference}
              </span>
            </div>

            <div className="mt-2 flex gap-3 text-xs text-muted-foreground sm:hidden">
              <span>P {row.played}</span>
              <span className="text-success">W {row.wins}</span>
              <span className="text-danger">L {row.losses}</span>
              <span>PF {row.pointsFor}</span>
              <span>PD {row.pointDifference > 0 ? "+" : ""}{row.pointDifference}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
