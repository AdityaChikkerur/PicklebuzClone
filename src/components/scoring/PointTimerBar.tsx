"use client";

import { ClockIcon } from "@heroicons/react/24/outline";
import type { PointTimerState } from "@/hooks/usePointTimer";

interface PointTimerBarProps {
  timer: PointTimerState;
}

export function PointTimerBar({ timer }: PointTimerBarProps) {
  if (!timer.active) return null;

  return (
    <div className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <ClockIcon className="h-4 w-4 text-warning" aria-hidden="true" />
        <span>
          Next point in{" "}
          <span className="font-bold tabular-nums text-warning">{timer.secondsLeft}s</span>
        </span>
      </div>
      <button
        type="button"
        onClick={timer.delay}
        className="rounded-lg border border-warning/50 bg-arena-surface px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
      >
        Delay
      </button>
    </div>
  );
}
