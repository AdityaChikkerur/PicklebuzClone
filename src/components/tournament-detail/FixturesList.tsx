"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDateTime } from "@/lib/utils";
import { getCategoryDisplayName, type TournamentCategory, type TournamentFixture } from "@/types/tournament";

interface FixturesListProps {
  fixtures: TournamentFixture[];
  isOrganizer?: boolean;
  categories?: TournamentCategory[];
  generating?: boolean;
  startingFixtureId?: string | null;
  onGenerate?: (categoryId: string) => void;
  onStartMatch?: (fixtureId: string) => void;
}

function statusVariant(
  status: TournamentFixture["status"]
): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "completed":
      return "success";
    case "live":
      return "danger";
    case "scheduled":
      return "default";
    default:
      return "default";
  }
}

export function FixturesList({
  fixtures,
  isOrganizer = false,
  categories = [],
  generating = false,
  startingFixtureId = null,
  onGenerate,
  onStartMatch,
}: FixturesListProps) {
  if (fixtures.length === 0) {
    return (
      <div className="card-base p-8 text-center">
        <p className="text-sm font-medium text-foreground">No fixtures yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Fixtures will appear once the organizer generates the schedule.
        </p>
        {isOrganizer && categories.length > 0 && onGenerate && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                disabled={generating}
                onClick={() => onGenerate(cat.id)}
                className="btn-primary text-xs"
              >
                {generating
                  ? "Generating…"
                  : `Generate ${getCategoryDisplayName(cat)}`}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-base divide-y divide-border overflow-hidden">
      <div className="hidden border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[5rem_1fr_6rem_5rem] sm:gap-3">
        <span>Round</span>
        <span>Matchup</span>
        <span>Score</span>
        <span className="text-right">Status</span>
      </div>

      <ul>
        {fixtures.map((fixture) => (
          <li
            key={fixture.id}
            className="px-4 py-3 transition-colors hover:bg-muted/20"
          >
            <div className="grid items-center gap-2 sm:grid-cols-[5rem_1fr_6rem_5rem] sm:gap-3">
              <Badge variant="outline" className="w-fit">
                {fixture.round}
              </Badge>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {fixture.teamA}
                  <span className="mx-1.5 font-normal text-muted-foreground">vs</span>
                  {fixture.teamB}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {fixture.scheduledAt && (
                    <span>{formatDateTime(fixture.scheduledAt)}</span>
                  )}
                  {fixture.court && <span>· {fixture.court}</span>}
                  {fixture.isUpset && (
                    <Badge variant="warning" className="text-[10px]">
                      UPSET
                    </Badge>
                  )}
                </div>
              </div>

              <span
                className={cn(
                  "text-sm font-bold tabular-nums",
                  fixture.score ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {fixture.score ?? "-"}
              </span>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <Badge variant={statusVariant(fixture.status)} dot={fixture.status === "live"}>
                  {fixture.status}
                </Badge>
                {fixture.matchId ? (
                  <Link
                    href={
                      fixture.status === "live"
                        ? `/spectate/${fixture.matchId}`
                        : `/match/${fixture.matchId}`
                    }
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View
                  </Link>
                ) : (
                  isOrganizer &&
                  onStartMatch &&
                  fixture.status === "scheduled" &&
                  fixture.teamB !== "BYE" &&
                  fixture.teamA !== "TBD" &&
                  fixture.teamB !== "TBD" && (
                    <button
                      type="button"
                      disabled={startingFixtureId === fixture.id}
                      onClick={() => onStartMatch(fixture.id)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {startingFixtureId === fixture.id ? "Starting…" : "Start"}
                    </button>
                  )
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
