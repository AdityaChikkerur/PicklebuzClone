import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { LeaderboardPlayer, RankingCategory } from "./types";
import { formatPrimaryStat, getPrimaryStatLabel } from "./utils";

interface RankingsTableProps {
  players: LeaderboardPlayer[];
  category: RankingCategory;
}

export function RankingsTable({ players, category }: RankingsTableProps) {
  const rest = players.slice(3);
  const statLabel = getPrimaryStatLabel(category);

  if (rest.length === 0) return null;

  return (
    <div className="card-base overflow-hidden">
      <div className="hidden border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[3rem_1fr_5rem_5rem_6rem] sm:gap-3">
        <span>Rank</span>
        <span>Player</span>
        <span className="text-right">{statLabel}</span>
        <span className="text-right">W / L</span>
        <span className="text-right">Win %</span>
      </div>

      <ul className="divide-y divide-border">
        {rest.map((player) => (
          <li
            key={player.id}
            className={cn(
              "px-4 py-3 transition-colors",
              player.isCurrentUser &&
                "border-l-4 border-primary bg-primary/5"
            )}
          >
            <div className="grid items-center gap-3 sm:grid-cols-[3rem_1fr_5rem_5rem_6rem]">
              <span className="text-sm font-bold tabular-nums text-muted-foreground">
                {player.rank}
              </span>

              <div className="flex min-w-0 items-center gap-3">
                <Avatar src={player.avatarUrl} name={player.fullName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {player.fullName}
                    {player.isCurrentUser && (
                      <span className="ml-1.5 text-xs font-medium text-primary">
                        (You)
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{player.city}</span>
                    <Badge variant="outline">{player.skillLevel}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-right text-sm font-bold tabular-nums text-primary sm:block">
                <span className="mr-2 text-xs font-medium text-muted-foreground sm:hidden">
                  {statLabel}:
                </span>
                {formatPrimaryStat(player, category)}
              </p>

              <p className="text-right text-sm tabular-nums text-foreground">
                <span className="mr-2 text-xs font-medium text-muted-foreground sm:hidden">
                  W/L:
                </span>
                {player.wins} / {player.losses}
              </p>

              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  <span className="mr-2 text-xs font-medium text-muted-foreground sm:hidden">
                    Win %:
                  </span>
                  {player.winPct}%
                </span>
                <div
                  className="h-1.5 w-full max-w-[5rem] overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={player.winPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${player.fullName} win percentage`}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${player.winPct}%` }}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
