import type { BracketMatch } from "@/types/tournament";

const ROUND_ORDER = ["R64", "R32", "R16", "QF", "SF", "Final", "RR"];

/** Sort bracket / fixture round labels in tournament order. */
export function getBracketRounds(matches: BracketMatch[]): string[] {
  const rounds = [...new Set(matches.map((m) => m.round))];
  return rounds.sort(
    (a, b) => ROUND_ORDER.indexOf(a) - ROUND_ORDER.indexOf(b)
  );
}
