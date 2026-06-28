"use client";

import { cn } from "@/lib/utils";
import { useMatchStore } from "@/store/matchStore";
import type { Team } from "@/types/match";
import { useTimeoutCountdown } from "./useTimeoutCountdown";

interface TimeoutBarProps {
  disabled?: boolean;
}

export function TimeoutBar({ disabled = false }: TimeoutBarProps) {
  const matchState = useMatchStore((s) => s.matchState);
  const callTimeout = useMatchStore((s) => s.callTimeout);
  const { activeTimeout, remaining, timeoutDuration, progress } =
    useTimeoutCountdown();

  const isDisabled = disabled || matchState.isMatchComplete;

  const renderButton = (team: Team, label: string, remaining: number) => {
    const isActive = activeTimeout === team;
    const canCall = remaining > 0 && !activeTimeout && !isDisabled;

    return (
      <button
        key={team}
        type="button"
        disabled={!canCall && !isActive}
        onClick={() => callTimeout(team)}
        className={cn(
          "flex flex-1 flex-col items-center rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
          isActive
            ? "border-warning bg-warning/20 text-warning"
            : canCall
              ? "border-border bg-arena-surface text-foreground hover:bg-muted"
              : "border-arena-border bg-arena-bg text-muted-foreground"
        )}
        aria-label={`${label} timeout, ${remaining} remaining`}
      >
        <span>{label}</span>
        <span className="text-[10px] font-normal opacity-80">
          {remaining} left
        </span>
      </button>
    );
  };

  return (
    <div className="border-t border-arena-border px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Timeouts
      </p>

      <div className="flex gap-2">
        {renderButton("A", matchState.teamAName, matchState.timeoutsA)}
        {renderButton("B", matchState.teamBName, matchState.timeoutsB)}
      </div>

      {activeTimeout && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-warning">
            <span>
              Timeout: Team {activeTimeout}
            </span>
            <span>{remaining}s</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-arena-surface">
            <div
              className="h-full rounded-full bg-warning transition-all duration-200"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={remaining}
              aria-valuemin={0}
              aria-valuemax={timeoutDuration}
            />
          </div>
        </div>
      )}
    </div>
  );
}
