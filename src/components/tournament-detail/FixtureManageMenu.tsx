"use client";

import { useState } from "react";
import {
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { ScheduleFixtureDialog } from "./CategoryTypeFilterBar";
import type { TournamentFixture } from "@/types/tournament";

export type FixtureAction =
  | "schedule"
  | "start"
  | "walkover"
  | "no_show"
  | "cancel_fixture"
  | "cancel_match"
  | "abandon"
  | "remove";

interface FixtureManageMenuProps {
  fixture: TournamentFixture;
  isOrganizer: boolean;
  starting?: boolean;
  busy?: boolean;
  onAction: (
    fixtureId: string,
    action: FixtureAction,
    extra?: { winner?: "A" | "B"; notes?: string; scheduledAt?: string; court?: string }
  ) => Promise<void>;
  onStartMatch?: (fixtureId: string) => void;
}

function canStart(fixture: TournamentFixture): boolean {
  return (
    fixture.status === "scheduled" &&
    Boolean(fixture.teamA) &&
    Boolean(fixture.teamB) &&
    fixture.teamB !== "BYE" &&
    fixture.teamA !== "TBD" &&
    fixture.teamB !== "TBD" &&
    !fixture.matchId
  );
}

function isResolvable(fixture: TournamentFixture): boolean {
  return fixture.status === "scheduled" && !fixture.outcome;
}

function isLive(fixture: TournamentFixture): boolean {
  return fixture.status === "live" && Boolean(fixture.matchId);
}

export function FixtureManageMenu({
  fixture,
  isOrganizer,
  starting = false,
  busy = false,
  onAction,
  onStartMatch,
}: FixtureManageMenuProps) {
  const [open, setOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  if (!isOrganizer) return null;

  const handleWalkover = async (winner: "A" | "B") => {
    const team = winner === "A" ? fixture.teamA : fixture.teamB;
    if (
      !window.confirm(
        `Award walkover to ${team}? The opponent will be recorded as forfeiting.`
      )
    ) {
      return;
    }
    setOpen(false);
    await onAction(fixture.id, "walkover", { winner });
  };

  const handleNoShow = async (present: "A" | "B") => {
    const absent = present === "A" ? fixture.teamB : fixture.teamA;
    if (
      !window.confirm(
        `Record no-show for ${absent}? ${present === "A" ? fixture.teamA : fixture.teamB} wins by default.`
      )
    ) {
      return;
    }
    setOpen(false);
    await onAction(fixture.id, "no_show", { winner: present });
  };

  const handleCancelFixture = async () => {
    if (!window.confirm("Cancel this fixture? No result will be recorded.")) return;
    setOpen(false);
    await onAction(fixture.id, "cancel_fixture");
  };

  const handleCancelMatch = async () => {
    if (!fixture.matchId) return;
    if (
      !window.confirm(
        "Cancel this match? The fixture will return to scheduled and can be restarted."
      )
    ) {
      return;
    }
    setOpen(false);
    await onAction(fixture.id, "cancel_match");
  };

  const handleAbandon = async () => {
    if (!fixture.matchId) return;
    const notes = window.prompt(
      "Reason for abandoning (optional):",
      "Match abandoned by organizer"
    );
    if (notes === null) return;
    setOpen(false);
    await onAction(fixture.id, "abandon", { notes });
  };

  const handleRemove = async () => {
    if (
      !window.confirm(
        "Remove this fixture from the schedule? This cannot be undone."
      )
    ) {
      return;
    }
    setOpen(false);
    await onAction(fixture.id, "remove");
  };

  const handleScheduleSave = async (scheduledAt: string, court: string) => {
    setSavingSchedule(true);
    await onAction(fixture.id, "schedule", { scheduledAt, court });
    setSavingSchedule(false);
    setScheduleOpen(false);
  };

  const showMenu =
    isResolvable(fixture) || isLive(fixture) || canStart(fixture) || fixture.scheduledAt;

  if (!showMenu) return null;

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={busy || starting}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Manage fixture"
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>

        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] rounded-xl border border-border bg-card py-1 shadow-lg">
              {isResolvable(fixture) && (
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setOpen(false);
                    setScheduleOpen(true);
                  }}
                >
                  Schedule…
                </button>
              )}
              {canStart(fixture) && onStartMatch && (
                <button
                  type="button"
                  disabled={starting}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setOpen(false);
                    onStartMatch(fixture.id);
                  }}
                >
                  {starting ? "Starting…" : "Go live"}
                </button>
              )}
              {isResolvable(fixture) && (
                <>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => void handleWalkover("A")}
                  >
                    Walkover — {fixture.teamA}
                  </button>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => void handleWalkover("B")}
                  >
                    Walkover — {fixture.teamB}
                  </button>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => void handleNoShow("A")}
                  >
                    No-show — {fixture.teamB} absent
                  </button>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => void handleNoShow("B")}
                  >
                    No-show — {fixture.teamA} absent
                  </button>
                  <button
                    type="button"
                    className="block w-full border-t border-border px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
                    onClick={() => void handleCancelFixture()}
                  >
                    Cancel fixture
                  </button>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
                    onClick={() => void handleRemove()}
                  >
                    Remove from schedule
                  </button>
                </>
              )}
              {isLive(fixture) && (
                <>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => void handleCancelMatch()}
                  >
                    Cancel match (pre-score)
                  </button>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
                    onClick={() => void handleAbandon()}
                  >
                    Abandon match
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <ScheduleFixtureDialog
        open={scheduleOpen}
        teamLabel={`${fixture.teamA} vs ${fixture.teamB}`}
        initialCourt={fixture.court}
        initialScheduledAt={fixture.scheduledAt}
        saving={savingSchedule}
        onClose={() => setScheduleOpen(false)}
        onSave={handleScheduleSave}
      />
    </>
  );
}
