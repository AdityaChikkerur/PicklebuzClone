"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MatchEvent } from "@/types/match";

const MIN_WAIT_SEC = 20;
const MAX_WAIT_SEC = 40;

function randomWaitSeconds(): number {
  return MIN_WAIT_SEC + Math.floor(Math.random() * (MAX_WAIT_SEC - MIN_WAIT_SEC + 1));
}

function lastPointEvent(events: MatchEvent[]): MatchEvent | null {
  return events.find((e) => e.eventType === "point") ?? null;
}

export interface PointTimerState {
  /** False while the between-point cooldown is active. */
  canScore: boolean;
  secondsLeft: number;
  active: boolean;
  /** Extend cooldown (ball retrieval, water, injury, etc.). */
  delay: () => void;
}

export function usePointTimer(
  events: MatchEvent[],
  enabled: boolean
): PointTimerState {
  const [readyAt, setReadyAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const lastPoint = useMemo(() => lastPointEvent(events), [events]);
  const lastPointId = lastPoint?.id ?? null;

  useEffect(() => {
    if (!enabled || !lastPointId) {
      setReadyAt(null);
      return;
    }
    setReadyAt(Date.now() + randomWaitSeconds() * 1000);
  }, [enabled, lastPointId]);

  useEffect(() => {
    if (!readyAt || Date.now() >= readyAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [readyAt]);

  const delay = useCallback(() => {
    setReadyAt(Date.now() + randomWaitSeconds() * 1000);
  }, []);

  const active = enabled && readyAt !== null && now < readyAt;
  const secondsLeft = active ? Math.max(0, Math.ceil((readyAt! - now) / 1000)) : 0;

  return {
    canScore: !active,
    secondsLeft,
    active,
    delay,
  };
}
