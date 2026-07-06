export type TimingFlag = "ok" | "short" | "long";

export const MIN_OFFICIAL_MATCH_MINUTES = 10;

/** Elapsed minutes between match start and end (or now if still in progress). */
export function computeMatchDurationMinutes(
  startedAt: string | null | undefined,
  completedAt: string | null | undefined,
  createdAt?: string | null
): number {
  const startIso = startedAt ?? createdAt;
  if (!startIso) return 0;
  const endMs = completedAt ? new Date(completedAt).getTime() : Date.now();
  const startMs = new Date(startIso).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return 0;
  }
  return (endMs - startMs) / 60_000;
}

/** Whether a completed match counts toward player stats and ratings. */
export function isMatchTimingValid(
  durationMinutes: number,
  bestOf: number,
  scoreFlagged = false
): boolean {
  if (scoreFlagged) return false;
  if (bestOf >= 3 && durationMinutes < MIN_OFFICIAL_MATCH_MINUTES) return false;
  return durationMinutes > 0;
}

export interface MatchDurationAnalysis {
  durationMinutes: number;
  timingFlag: TimingFlag;
  scoreFlagged: boolean;
  message: string | null;
}

/**
 * Classify match duration for best-of-3+ pickleball.
 * Flags unusual timing without blocking save.
 */
export function analyzeMatchDuration(
  durationMinutes: number,
  bestOf: number
): MatchDurationAnalysis {
  if (bestOf < 3) {
    return {
      durationMinutes,
      timingFlag: "ok",
      scoreFlagged: false,
      message: null,
    };
  }

  if (durationMinutes < 10) {
    return {
      durationMinutes,
      timingFlag: "short",
      scoreFlagged: true,
      message:
        "This match finished unusually fast (under 10 min). It has been flagged for review.",
    };
  }

  if (durationMinutes < 15) {
    return {
      durationMinutes,
      timingFlag: "short",
      scoreFlagged: false,
      message:
        "This match was shorter than typical (under 15 min). Timing noted.",
    };
  }

  if (durationMinutes > 60) {
    return {
      durationMinutes,
      timingFlag: "long",
      scoreFlagged: true,
      message:
        "This match ran over 60 minutes. It has been flagged for review.",
    };
  }

  return {
    durationMinutes,
    timingFlag: "ok",
    scoreFlagged: false,
    message: null,
  };
}
