"use client";

import { useEffect, useState } from "react";
import { useMatchStore } from "@/store/matchStore";

export function useTimeoutCountdown() {
  const activeTimeout = useMatchStore((s) => s.matchState.activeTimeout);
  const timeoutEndsAt = useMatchStore((s) => s.matchState.timeoutEndsAt);
  const timeoutDuration = useMatchStore((s) => s.matchState.timeoutDuration);
  const clearTimeout = useMatchStore((s) => s.clearTimeout);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!activeTimeout || !timeoutEndsAt) {
      setRemaining(0);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((timeoutEndsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearTimeout();
      }
    };

    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [activeTimeout, timeoutEndsAt, clearTimeout]);

  const progress =
    activeTimeout && timeoutDuration > 0
      ? ((timeoutDuration - remaining) / timeoutDuration) * 100
      : 0;

  return { activeTimeout, remaining, timeoutDuration, progress };
}
