"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useAuthStore } from "@/store/authStore";
import { formatBuzzRating } from "@/lib/utils";

export function CityRankingsCard() {
  const profile = useAuthStore((s) => s.profile);
  const { cityRankings, loading } = usePlayerStats();
  const city = profile?.city ?? cityRankings[0]?.city ?? "Your City";

  return (
    <div className="card-base p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-foreground">{city} Rankings</h2>
          <p className="text-xs text-muted-foreground">Top players in your city</p>
        </div>
        <Link
          href="/rankings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          View all
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <ul className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-14 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </ul>
      ) : cityRankings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No ranked players in {city} yet. Verify a match to appear on the board.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {cityRankings.map((player) => (
            <li
              key={player.id}
              className={
                player.isCurrentUser
                  ? "flex items-center gap-3 rounded-xl border-l-4 border-primary bg-primary/5 px-3 py-2.5"
                  : "flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted/50"
              }
            >
              <span
                className={
                  player.rank <= 3
                    ? "w-6 text-center text-sm font-bold text-warning"
                    : "w-6 text-center text-sm font-bold text-muted-foreground"
                }
              >
                {player.rank}
              </span>
              <Avatar src={player.avatarUrl} name={player.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {player.fullName}
                  {player.isCurrentUser && (
                    <span className="ml-1.5 text-xs font-medium text-primary">(You)</span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{player.skillLevel}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {player.wins}W · {player.losses}L
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold tabular-nums text-primary">
                {formatBuzzRating(player.playerRating ?? player.duprRating)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
