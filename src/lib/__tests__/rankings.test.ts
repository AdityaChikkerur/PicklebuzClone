import { describe, expect, it } from "vitest";
import {
  getPrimaryStat,
  rankPlayers,
} from "@/components/rankings/utils";
import type { LeaderboardPlayer } from "@/components/rankings/types";

function mockPlayer(overrides: Partial<LeaderboardPlayer>): LeaderboardPlayer {
  return {
    id: "p1",
    rank: 0,
    fullName: "Test Player",
    avatarUrl: null,
    city: "Bangalore",
    skillLevel: "3.5",
    duprRating: 3.5,
    singlesRating: 3.6,
    doublesRating: 3.4,
    wins: 10,
    losses: 5,
    winPct: 67,
    currentStreak: 2,
    strengthRating: 3.8,
    ...overrides,
  };
}

describe("rankPlayers", () => {
  it("ranks by strength rating descending", () => {
    const players = [
      mockPlayer({ id: "a", strengthRating: 3.2 }),
      mockPlayer({ id: "b", strengthRating: 4.5 }),
      mockPlayer({ id: "c", strengthRating: 3.9 }),
    ];

    const ranked = rankPlayers(players, "strength");
    expect(ranked[0].id).toBe("b");
    expect(ranked[0].rank).toBe(1);
    expect(ranked[2].id).toBe("a");
  });

  it("uses win pct for winpct category", () => {
    const a = mockPlayer({ id: "a", winPct: 50 });
    const b = mockPlayer({ id: "b", winPct: 80 });
    expect(getPrimaryStat(b, "winpct")).toBe(80);
    expect(rankPlayers([a, b], "winpct")[0].id).toBe("b");
  });
});
