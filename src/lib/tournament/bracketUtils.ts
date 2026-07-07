import type { BracketMatch, TournamentFixture } from "@/types/tournament";

const ROUND_ORDER = ["R64", "R32", "R16", "QF", "SF", "Final", "RR"];

const KNOCKOUT_ROUNDS = new Set(["R64", "R32", "R16", "QF", "SF", "Final"]);

/** Sort bracket / fixture round labels in tournament order. */
export function getBracketRounds(matches: BracketMatch[]): string[] {
  const rounds = [...new Set(matches.map((m) => m.round))];
  return rounds.sort(
    (a, b) => ROUND_ORDER.indexOf(a) - ROUND_ORDER.indexOf(b)
  );
}

function winnerFromFixture(fixture: TournamentFixture): "A" | "B" | undefined {
  if (fixture.outcomeWinner) return fixture.outcomeWinner;
  if (fixture.status === "completed" || fixture.status === "walkover") {
    if (fixture.score) {
      const parts = fixture.score.split(/[–,-]/).map((s) => s.trim());
      const a = parseInt(parts[0] ?? "0", 10);
      const b = parseInt(parts[1] ?? "0", 10);
      if (a > b) return "A";
      if (b > a) return "B";
    }
  }
  return undefined;
}

/** Build knockout bracket view models from loaded fixtures. */
export function fixturesToBracketMatches(
  fixtures: TournamentFixture[]
): BracketMatch[] {
  const bracketFixtures = fixtures.filter((f) => KNOCKOUT_ROUNDS.has(f.round));

  const byRound = new Map<string, TournamentFixture[]>();
  for (const fixture of bracketFixtures) {
    const list = byRound.get(fixture.round) ?? [];
    list.push(fixture);
    byRound.set(fixture.round, list);
  }

  const matches: BracketMatch[] = [];
  for (const [round, roundFixtures] of byRound) {
    roundFixtures.forEach((fixture, position) => {
      matches.push({
        id: fixture.id,
        round,
        position,
        teamA: fixture.teamA === "TBD" ? null : fixture.teamA,
        teamB:
          fixture.teamB === "TBD" || fixture.teamB === "BYE"
            ? null
            : fixture.teamB,
        score: fixture.score,
        winner: winnerFromFixture(fixture),
        matchId: fixture.matchId,
        status: fixture.status,
        isUpset: fixture.isUpset,
      });
    });
  }

  return matches;
}

export function hasKnockoutBracket(
  format?: string | null
): boolean {
  return format === "knockout" || format === "group_knockout";
}
