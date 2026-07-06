"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import type { MatchType, RecentMatch } from "@/types/match";
import { formatRelativeTime } from "@/lib/utils";

type SortField = "playedAt" | "opponent" | "result" | "matchType";
type SortDir = "asc" | "desc";

const MATCH_TYPE_FILTERS: { label: string; value: MatchType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Singles", value: "singles" },
  { label: "Doubles", value: "doubles" },
  { label: "Mixed", value: "mixed" },
];

function statusVariant(
  status: RecentMatch["status"]
): "success" | "warning" | "danger" {
  if (status === "Verified") return "success";
  if (status === "Pending") return "warning";
  return "danger";
}

function SortButton({
  label,
  field,
  activeField,
  dir,
  onSort,
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  dir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const active = activeField === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-0.5 font-semibold text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
    >
      {label}
      {active &&
        (dir === "asc" ? (
          <ChevronUpIcon className="h-3 w-3" />
        ) : (
          <ChevronDownIcon className="h-3 w-3" />
        ))}
    </button>
  );
}

export function RecentMatchesTable() {
  const { recentMatches, loading } = usePlayerStats();
  const [typeFilter, setTypeFilter] = useState<MatchType | "all">("all");
  const [sortField, setSortField] = useState<SortField>("playedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const matches = useMemo(() => {
    let list = [...recentMatches];
    if (typeFilter !== "all") {
      list = list.filter((m) => m.matchType === typeFilter);
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "playedAt") {
        cmp = new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime();
      } else if (sortField === "opponent") {
        cmp = a.opponent.localeCompare(b.opponent);
      } else if (sortField === "result") {
        cmp = a.result.localeCompare(b.result);
      } else {
        cmp = a.matchType.localeCompare(b.matchType);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [recentMatches, typeFilter, sortField, sortDir]);

  return (
    <div id="matches" className="card-base overflow-hidden">
      <div className="border-b border-border p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-bold text-foreground">Recent Matches</h2>
        <div className="flex flex-wrap gap-2">
          {MATCH_TYPE_FILTERS.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              active={typeFilter === f.value}
              onClick={() => setTypeFilter(f.value)}
            />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs">
              <th className="px-4 py-3 sm:px-5">
                <SortButton
                  label="Opponent"
                  field="opponent"
                  activeField={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 sm:px-5">Score</th>
              <th className="px-4 py-3 sm:px-5">
                <SortButton
                  label="Result"
                  field="result"
                  activeField={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden px-4 py-3 sm:table-cell sm:px-5">
                <SortButton
                  label="Type"
                  field="matchType"
                  activeField={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden px-4 py-3 md:table-cell sm:px-5">Venue</th>
              <th className="px-4 py-3 sm:px-5">Status</th>
              <th className="px-4 py-3 sm:px-5">
                <SortButton
                  label="Date"
                  field="playedAt"
                  activeField={sortField}
                  dir={sortDir}
                  onSort={handleSort}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5"
                >
                  Loading matches…
                </td>
              </tr>
            ) : matches.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5"
                >
                  No verified matches yet. Finish and verify a match to see it here.
                </td>
              </tr>
            ) : (
              matches.map((match) => (
                <tr
                  key={match.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium sm:px-5">
                    <Link
                      href={`/match/${match.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {match.opponent}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground sm:px-5">
                    {match.score}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <Badge variant={match.result === "W" ? "win" : "loss"}>
                      {match.result === "W" ? "Win" : "Loss"}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 capitalize text-muted-foreground sm:table-cell sm:px-5">
                    {match.matchType}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell sm:px-5">
                    {match.venue}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <Badge variant={statusVariant(match.status)}>{match.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground sm:px-5">
                    {formatRelativeTime(match.playedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
