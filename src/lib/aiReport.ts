import type {
  FaultType,
  GameScore,
  MatchEvent,
  MatchPlayer,
  MatchState,
  Team,
} from "@/types/match";

export interface MatchReportInput {
  teamAName: string;
  teamBName: string;
  matchWinner: Team | null;
  gameScores: GameScore[];
  events: MatchEvent[];
  players: MatchPlayer[];
  stats?: {
    faultsA: Record<FaultType, number>;
    faultsB: Record<FaultType, number>;
  };
}

function totalFaults(faults: Record<FaultType, number>): number {
  return Object.values(faults).reduce((sum, n) => sum + n, 0);
}

function detectComeback(gameScores: GameScore[], winner: Team | null): boolean {
  if (!winner || gameScores.length < 2) return false;
  const finalGame = gameScores[gameScores.length - 1];
  if (finalGame.winner !== winner) return false;
  const loser = winner === "A" ? "B" : "A";
  const loserWonEarlier = gameScores
    .slice(0, -1)
    .some((g) => g.winner === loser);
  return loserWonEarlier && finalGame.winner === winner;
}

function findBestPerformer(
  players: MatchPlayer[],
  events: MatchEvent[]
): string {
  const pointsByPlayer = new Map<string, number>();

  for (const player of players) {
    pointsByPlayer.set(player.playerId, 0);
  }

  for (const event of events) {
    if (event.eventType !== "point" || !event.team) continue;
    const teamPlayers = players.filter((p) => p.team === event.team);
    for (const p of teamPlayers) {
      pointsByPlayer.set(
        p.playerId,
        (pointsByPlayer.get(p.playerId) ?? 0) + 1
      );
    }
  }

  let bestId = players[0]?.playerId ?? "";
  let bestPoints = -1;
  for (const [id, pts] of pointsByPlayer) {
    if (pts > bestPoints) {
      bestPoints = pts;
      bestId = id;
    }
  }

  return players.find((p) => p.playerId === bestId)?.fullName ?? "Unknown";
}

function describeGameFlow(gameScores: GameScore[], teamAName: string, teamBName: string): string[] {
  const lines: string[] = [];
  if (gameScores.length === 0) return lines;

  const first = gameScores[0];
  const firstWinner = first.winner === "A" ? teamAName : teamBName;
  if (first.scoreA + first.scoreB >= 15) {
    lines.push(`${firstWinner} dominated the opening game (${first.scoreA}-${first.scoreB}).`);
  } else {
    lines.push(`A competitive start — Game 1 went to ${firstWinner}.`);
  }

  if (gameScores.length >= 2) {
    const second = gameScores[1];
    if (second.winner !== first.winner) {
      const comebackName = second.winner === "A" ? teamAName : teamBName;
      lines.push(`${comebackName} bounced back in Game 2 (${second.scoreA}-${second.scoreB}).`);
    }
  }

  return lines;
}

/**
 * Rule-based match report generator (no external API).
 * Rating constants for future rankings integration:
 *   win_bonus = 0.05, loss_penalty = 0.03, tournament_bonus = 0.10
 */
export function generateReport(input: MatchReportInput): string[] {
  const lines: string[] = [];
  const winnerName =
    input.matchWinner === "A"
      ? input.teamAName
      : input.matchWinner === "B"
        ? input.teamBName
        : null;

  lines.push(...describeGameFlow(input.gameScores, input.teamAName, input.teamBName));

  if (winnerName) {
    lines.push(`${winnerName} took the match.`);
  }

  if (detectComeback(input.gameScores, input.matchWinner)) {
    lines.push("A strong comeback decided the outcome in the final game.");
  }

  const best = findBestPerformer(input.players, input.events);
  if (best !== "Unknown") {
    lines.push(`${best} performed best under pressure.`);
  }

  if (input.stats) {
    const aFaults = totalFaults(input.stats.faultsA);
    const bFaults = totalFaults(input.stats.faultsB);
    if (aFaults + bFaults > 8) {
      const cleaner = aFaults <= bFaults ? input.teamAName : input.teamBName;
      lines.push(`${cleaner} kept errors lower — a key factor in the result.`);
    }
  }

  return lines.slice(0, 5);
}

export function generateReportFromState(state: MatchState): string[] {
  return generateReport({
    teamAName: state.teamAName,
    teamBName: state.teamBName,
    matchWinner: state.matchWinner,
    gameScores: state.gameScores,
    events: state.events,
    players: [],
    stats: { faultsA: state.faultsA, faultsB: state.faultsB },
  });
}

/** Stub for future OpenAI / Gemini Edge Function integration */
export async function generateReportAI(
  input: MatchReportInput
): Promise<string> {
  await new Promise((r) => setTimeout(r, 600));
  const base = generateReport(input);
  return [
    ...base,
    "AI insight: Momentum shifted after the first timeout — consider earlier tactical pauses.",
  ].join("\n");
}
