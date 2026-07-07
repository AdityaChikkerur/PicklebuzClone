"use client";

import {
  CalendarDaysIcon,
  PlusCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { FixturesList } from "./FixturesList";
import type { FixtureAction } from "./FixtureManageMenu";
import {
  getCategoryDisplayName,
  TOURNAMENT_FORMAT_LABELS,
  type TournamentCategory,
  type TournamentDetail,
  type TournamentFixture,
  type TournamentRegistration,
} from "@/types/tournament";

interface FixturesTabProps {
  tournament: TournamentDetail;
  fixtures: TournamentFixture[];
  registrations: TournamentRegistration[];
  isOrganizer: boolean;
  generating?: boolean;
  startingFixtureId?: string | null;
  fixtureActionBusy?: boolean;
  onGenerate?: (categoryId: string) => void;
  onStartMatch?: (fixtureId: string) => void;
  onFixtureAction?: (
    fixtureId: string,
    action: FixtureAction,
    extra?: {
      winner?: "A" | "B";
      notes?: string;
      scheduledAt?: string;
      court?: string;
    }
  ) => Promise<void>;
}

function categoryFixtureStats(
  categories: TournamentCategory[],
  fixtures: TournamentFixture[],
  registrations: TournamentRegistration[]
) {
  return categories.map((cat) => {
    const catFixtures = fixtures.filter((f) => f.categoryId === cat.id);
    const approved = registrations.filter(
      (r) => r.categoryId === cat.id && r.status === "approved"
    ).length;
    const scheduled = catFixtures.filter((f) => f.scheduledAt).length;
    const live = catFixtures.filter((f) => f.status === "live").length;
    const done = catFixtures.filter((f) =>
      ["completed", "walkover", "no_show"].includes(f.status)
    ).length;

    return {
      category: cat,
      approved,
      total: catFixtures.length,
      scheduled,
      live,
      done,
      hasFixtures: catFixtures.length > 0,
    };
  });
}

export function FixturesTab({
  tournament,
  fixtures,
  registrations,
  isOrganizer,
  generating = false,
  startingFixtureId = null,
  fixtureActionBusy = false,
  onGenerate,
  onStartMatch,
  onFixtureAction,
}: FixturesTabProps) {
  const stats = categoryFixtureStats(
    tournament.categories,
    fixtures,
    registrations
  );

  const totalScheduled = fixtures.filter((f) => f.scheduledAt).length;
  const totalLive = fixtures.filter((f) => f.status === "live").length;
  const totalDone = fixtures.filter((f) =>
    ["completed", "walkover", "no_show"].includes(f.status)
  ).length;

  return (
    <div className="flex flex-col gap-4">
      {isOrganizer && (
        <div className="card-base overflow-hidden">
          <div className="border-b border-border bg-secondary/5 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
                  <SparklesIcon className="h-4 w-4 text-secondary" aria-hidden />
                  Match schedule manager
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Generate fixtures from approved players, schedule courts and
                  times, then go live from the Live tab or each row.
                </p>
              </div>
              {tournament.format && (
                <span className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {TOURNAMENT_FORMAT_LABELS[tournament.format]}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {fixtures.length}
              </p>
              <p className="text-xs text-muted-foreground">Total fixtures</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {totalScheduled}
              </p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {totalLive}
                <span className="mx-1 text-base font-normal text-muted-foreground">
                  /
                </span>
                {totalDone}
              </p>
              <p className="text-xs text-muted-foreground">Live / completed</p>
            </div>
          </div>

          {stats.length > 0 && (
            <div className="border-t border-border px-4 py-4 sm:px-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Generate by category
              </p>
              <div className="flex flex-col gap-2">
                {stats.map(
                  ({ category, approved, total, hasFixtures, scheduled }) => (
                    <div
                      key={category.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {getCategoryDisplayName(category)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {approved} approved
                          {hasFixtures
                            ? ` · ${total} fixtures · ${scheduled} scheduled`
                            : " · no fixtures yet"}
                        </p>
                      </div>
                      {!hasFixtures && onGenerate && (
                        <button
                          type="button"
                          disabled={generating || approved < 2}
                          onClick={() => onGenerate(category.id)}
                          className="btn-primary inline-flex shrink-0 items-center gap-1.5 text-xs"
                          title={
                            approved < 2
                              ? "Need at least 2 approved registrations"
                              : undefined
                          }
                        >
                          <PlusCircleIcon className="h-4 w-4" aria-hidden />
                          {generating ? "Generating…" : "Generate"}
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!isOrganizer && fixtures.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <CalendarDaysIcon className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            {totalScheduled} of {fixtures.length} matches scheduled
            {totalLive > 0 && ` · ${totalLive} live now`}
          </span>
        </div>
      )}

      <FixturesList
        fixtures={fixtures}
        isOrganizer={isOrganizer}
        categories={tournament.categories}
        generating={generating}
        startingFixtureId={startingFixtureId}
        fixtureActionBusy={fixtureActionBusy}
        onGenerate={onGenerate}
        onStartMatch={onStartMatch}
        onFixtureAction={onFixtureAction}
      />
    </div>
  );
}
