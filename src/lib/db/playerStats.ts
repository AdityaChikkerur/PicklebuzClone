import { createClient } from "@/lib/supabase";
import type { GameScore, MatchType, RecentMatch, Team } from "@/types/match";
import type {
  DashboardKpis,
  WeeklyPerformance,
} from "@/components/dashboard/mockData";

function profileName(profiles: unknown): string {
  if (Array.isArray(profiles)) {
    const first = profiles[0] as { full_name?: string } | undefined;
    return first?.full_name ?? "Opponent";
  }
  if (profiles && typeof profiles === "object" && "full_name" in profiles) {
    return String((profiles as { full_name: string }).full_name);
  }
  return "Opponent";
}

const OFFICIAL_STATUSES = ["verified", "completed"] as const;

export interface PlayerMatchRecord {
  id: string;
  matchType: MatchType;
  matchCategory: string;
  venue: string;
  city: string;
  status: string;
  winner: Team | null;
  playerTeam: Team;
  completedAt: string | null;
  createdAt: string;
  gameScores: GameScore[];
  opponentNames: string[];
}

function formatScoreLine(gameScores: GameScore[], playerTeam: Team): string {
  if (gameScores.length === 0) return "—";
  return gameScores
    .map((g) => {
      const mine = playerTeam === "A" ? g.scoreA : g.scoreB;
      const theirs = playerTeam === "A" ? g.scoreB : g.scoreA;
      return `${mine}-${theirs}`;
    })
    .join(", ");
}

function mapStatus(status: string): RecentMatch["status"] {
  if (status === "verified" || status === "completed") return "Verified";
  if (status === "pending") return "Pending";
  return "Disputed";
}

function weekLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Matches a player participated in (official + pending for history). */
export async function fetchPlayerMatches(
  playerId: string
): Promise<PlayerMatchRecord[]> {
  const supabase = createClient();

  const { data: participations, error: partError } = await supabase
    .from("match_players")
    .select("match_id, team")
    .eq("player_id", playerId);

  if (partError || !participations?.length) return [];

  const teamByMatch = new Map<string, Team>();
  const matchIds: string[] = [];
  for (const row of participations) {
    const matchId = row.match_id as string;
    matchIds.push(matchId);
    teamByMatch.set(matchId, row.team as Team);
  }

  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select(
      `
      id,
      match_type,
      match_category,
      venue,
      city,
      status,
      winner,
      completed_at,
      created_at,
      match_game_scores (
        game_number,
        score_a,
        score_b,
        winner
      )
    `
    )
    .in("id", matchIds)
    .in("status", ["verified", "completed", "pending", "disputed"])
    .order("completed_at", { ascending: false, nullsFirst: false });

  if (matchError || !matches?.length) return [];

  const { data: allPlayers } = await supabase
    .from("match_players")
    .select(
      `
      match_id,
      team,
      profiles ( full_name )
    `
    )
    .in("match_id", matchIds);

  const opponentsByMatch = new Map<string, string[]>();
  for (const mp of allPlayers ?? []) {
    const matchId = mp.match_id as string;
    const playerTeam = teamByMatch.get(matchId);
    if (!playerTeam || mp.team === playerTeam) continue;
    const name = profileName(mp.profiles);
    const list = opponentsByMatch.get(matchId) ?? [];
    list.push(name);
    opponentsByMatch.set(matchId, list);
  }

  return matches.map((m) => {
    const playerTeam = teamByMatch.get(m.id as string)!;
    const gameScores: GameScore[] = (
      (m.match_game_scores as Array<{
        game_number: number;
        score_a: number;
        score_b: number;
        winner: Team | null;
      }>) ?? []
    )
      .sort((a, b) => a.game_number - b.game_number)
      .map((g) => ({
        gameNumber: g.game_number,
        scoreA: g.score_a,
        scoreB: g.score_b,
        winner: g.winner,
      }));

    return {
      id: m.id as string,
      matchType: m.match_type as MatchType,
      matchCategory: m.match_category as string,
      venue: (m.venue as string) ?? "",
      city: (m.city as string) ?? "",
      status: m.status as string,
      winner: m.winner as Team | null,
      playerTeam,
      completedAt: m.completed_at as string | null,
      createdAt: m.created_at as string,
      gameScores,
      opponentNames: opponentsByMatch.get(m.id as string) ?? ["Opponent"],
    };
  });
}

function isOfficial(record: PlayerMatchRecord): boolean {
  return (
    OFFICIAL_STATUSES.includes(record.status as (typeof OFFICIAL_STATUSES)[number]) &&
    record.winner !== null
  );
}

function playerWon(record: PlayerMatchRecord): boolean {
  return record.winner === record.playerTeam;
}

export function computeDashboardKpis(
  matches: PlayerMatchRecord[],
  duprRating: number
): DashboardKpis {
  const official = matches.filter(isOfficial);
  const wins = official.filter(playerWon).length;
  const total = official.length;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = official.filter((m) => {
    const at = m.completedAt ?? m.createdAt;
    return new Date(at).getTime() >= thirtyDaysAgo;
  });
  const recentWins = recent.filter(playerWon).length;

  let streak = 0;
  for (const m of official) {
    if (playerWon(m)) streak += 1;
    else break;
  }

  const tournamentWins = official.filter(
    (m) => m.matchCategory === "tournament" && playerWon(m)
  ).length;

  return {
    duprRating,
    duprChange: 0,
    winRate: recent.length > 0 ? Math.round((recentWins / recent.length) * 100) : total > 0 ? Math.round((wins / total) * 100) : 0,
    winStreak: streak,
    matchesPlayed: total,
    tournamentWins,
    faultRate: 0,
  };
}

export function computeCurrentForm(matches: PlayerMatchRecord[]): ("W" | "L")[] {
  return matches
    .filter(isOfficial)
    .slice(0, 10)
    .map((m) => (playerWon(m) ? "W" : "L"));
}

export function computeRecentMatches(matches: PlayerMatchRecord[]): RecentMatch[] {
  return matches
    .filter(isOfficial)
    .slice(0, 20)
    .map((m) => ({
      id: m.id,
      opponent: m.opponentNames.join(" & "),
      score: formatScoreLine(m.gameScores, m.playerTeam),
      result: playerWon(m) ? "W" : "L",
      matchType: m.matchType,
      venue: m.venue,
      city: m.city,
      status: mapStatus(m.status),
      playedAt: m.completedAt ?? m.createdAt,
    }));
}

export function computeWeeklyPerformance(
  matches: PlayerMatchRecord[],
  duprRating: number
): WeeklyPerformance[] {
  const official = matches.filter(isOfficial);
  const now = new Date();
  const weeks: WeeklyPerformance[] = [];

  for (let i = 11; i >= 0; i -= 1) {
    const weekStart = startOfWeek(new Date(now));
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const inWeek = official.filter((m) => {
      const at = new Date(m.completedAt ?? m.createdAt);
      return at >= weekStart && at < weekEnd;
    });

    weeks.push({
      week: weekLabel(weekStart),
      wins: inWeek.filter(playerWon).length,
      losses: inWeek.filter((m) => !playerWon(m)).length,
      rating: duprRating,
      singles: inWeek.filter((m) => m.matchType === "singles").length,
      doubles: inWeek.filter((m) => m.matchType === "doubles").length,
      mixed: inWeek.filter((m) => m.matchType === "mixed").length,
    });
  }

  return weeks;
}

export async function fetchPlayerRankingSummary(playerId: string): Promise<{
  wins: number;
  losses: number;
  winPct: number;
  currentStreak: number;
} | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("player_rankings")
    .select("wins, losses, win_pct, current_streak")
    .eq("id", playerId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    wins: data.wins as number,
    losses: data.losses as number,
    winPct: Number(data.win_pct),
    currentStreak: data.current_streak as number,
  };
}

export async function fetchPlayerFaultRate(playerId: string): Promise<number> {
  const supabase = createClient();

  const { data: participations } = await supabase
    .from("match_players")
    .select(
      `
      team,
      match_id,
      matches!inner ( status )
    `
    )
    .eq("player_id", playerId)
    .in("matches.status", [...OFFICIAL_STATUSES]);

  if (!participations?.length) return 0;

  const teamByMatch = new Map<string, Team>();
  const matchIds: string[] = [];
  for (const row of participations) {
    const matchId = row.match_id as string;
    matchIds.push(matchId);
    teamByMatch.set(matchId, row.team as Team);
  }

  const { data: faults } = await supabase
    .from("match_events")
    .select("match_id, team")
    .in("match_id", matchIds)
    .eq("event_type", "fault");

  const { data: points } = await supabase
    .from("match_events")
    .select("match_id")
    .in("match_id", matchIds)
    .eq("event_type", "point");

  if (!faults?.length) return 0;

  let playerFaults = 0;
  for (const f of faults) {
    const playerTeam = teamByMatch.get(f.match_id as string);
    if (playerTeam && f.team === playerTeam) playerFaults += 1;
  }

  const totalPoints = points?.length ?? 0;
  if (totalPoints === 0) {
    return Math.round((playerFaults / matchIds.length) * 10) / 10;
  }

  return Math.round((playerFaults / totalPoints) * 1000) / 10;
}
