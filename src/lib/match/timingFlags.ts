export type TimingFlag = "ok" | "short" | "long";

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
