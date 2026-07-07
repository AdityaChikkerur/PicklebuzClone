"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDateTime } from "@/lib/utils";
import {
  getCategoryDisplayName,
  type TournamentCategory,
  type TournamentFixture,
} from "@/types/tournament";
import {
  FixtureManageMenu,
  type FixtureAction,
} from "./FixtureManageMenu";

interface FixturesListProps {
  fixtures: TournamentFixture[];
  isOrganizer?: boolean;
  categories?: TournamentCategory[];
  generating?: boolean;
  startingFixtureId?: string | null;
  fixtureActionBusy?: boolean;
  onGenerate?: (categoryId: string) => void;
  onStartMatch?: (fixtureId: string) => void;
  onFixtureAction?: (
    fixtureId: string,
    action: FixtureAction,
    extra?: { winner?: "A" | "B"; notes?: string; scheduledAt?: string; court?: string }
  ) => Promise<void>;
}

function statusVariant(
  status: TournamentFixture["status"]
): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "completed":
    case "walkover":
    case "no_show":
      return "success";
    case "live":
      return "danger";
    case "scheduled":
      return "default";
    case "cancelled":
    case "abandoned":
      return "warning";
    default:
      return "default";
  }
}

function statusLabel(status: TournamentFixture["status"]): string {
  switch (status) {
    case "walkover":
      return "walkover";
    case "no_show":
      return "no-show";
    case "abandoned":
      return "abandoned";
    default:
      return status;
  }
}

export function FixturesList({
  fixtures,
  isOrganizer = false,
  categories = [],
  generating = false,
  startingFixtureId = null,
  fixtureActionBusy = false,
  onGenerate,
  onStartMatch,
  onFixtureAction,
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
      <div className="hidden border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[5rem_1fr_6rem_5rem_auto] sm:gap-3">
        <span>Round</span>
        <span>Matchup</span>
        <span>Score</span>
        <span className="text-right">Status</span>
        <span />
      </div>

      <ul>
        {fixtures.map((fixture) => (
          <li
            key={fixture.id}
            className="px-4 py-3 transition-colors hover:bg-muted/20"
          >
            <div className="grid items-center gap-2 sm:grid-cols-[5rem_1fr_6rem_5rem_auto] sm:gap-3">
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
                  {fixture.categoryType && (
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {fixture.categoryType === "mixed"
                        ? "Mixed doubles"
                        : fixture.categoryType}
                    </Badge>
                  )}
                  {fixture.scheduledAt && (
                    <span>{formatDateTime(fixture.scheduledAt)}</span>
                  )}
                  {fixture.court && <span>· {fixture.court}</span>}
                  {fixture.isUpset && (
                    <Badge variant="warning" className="text-[10px]">
                      UPSET
                    </Badge>
                  )}
                  {fixture.outcomeNotes && (
                    <span className="italic">· {fixture.outcomeNotes}</span>
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
                  {statusLabel(fixture.status)}
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

              {isOrganizer && onFixtureAction && (
                <FixtureManageMenu
                  fixture={fixture}
                  isOrganizer={isOrganizer}
                  starting={startingFixtureId === fixture.id}
                  busy={fixtureActionBusy}
                  onAction={onFixtureAction}
                  onStartMatch={onStartMatch}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
