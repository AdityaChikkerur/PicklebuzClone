import { createClient } from "@/lib/supabase";
import type { SkillLevel } from "@/types/player";
import type { LeaderboardPlayer } from "@/components/rankings/types";

interface DbPlayerRankingRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string;
  role: string;
  skill_level: SkillLevel;
  dupr_rating: number;
  wins: number;
  total_matches: number;
  losses: number;
  win_pct: number;
  current_streak: number;
}

function ratingFromWinPct(dupr: number, winPct: number): number {
  if (winPct <= 0) return dupr;
  return Math.round((dupr + (winPct / 100 - 0.5) * 0.4) * 100) / 100;
}

function mapToLeaderboardPlayer(
  row: DbPlayerRankingRow,
  typeStats: Map<string, { wins: number; total: number }>,
  strengthRating: number,
  currentUserId?: string
): LeaderboardPlayer {
  const dupr = Number(row.dupr_rating);
  const singles = typeStats.get("singles");
  const doubles = typeStats.get("doubles");
  const mixed = typeStats.get("mixed");

  const singlesWinPct =
    singles && singles.total > 0 ? (singles.wins / singles.total) * 100 : Number(row.win_pct);
  const doublesWinPct =
    doubles && doubles.total > 0
      ? (doubles.wins / doubles.total) * 100
      : mixed && mixed.total > 0
        ? (mixed.wins / mixed.total) * 100
        : Number(row.win_pct);

  return {
    id: row.id,
    rank: 0,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    city: row.city,
    skillLevel: row.skill_level,
    duprRating: dupr,
    singlesRating: ratingFromWinPct(dupr, singlesWinPct),
    doublesRating: ratingFromWinPct(dupr, doublesWinPct),
    wins: row.wins,
    losses: row.losses,
    winPct: Number(row.win_pct),
    currentStreak: row.current_streak,
    strengthRating,
    isCurrentUser: currentUserId === row.id,
  };
}

async function fetchStrengthRatings(): Promise<Map<string, number>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("player_rankings_strength")
    .select("id, strength_rating");

  const map = new Map<string, number>();
  if (error || !data) return map;

  for (const row of data) {
    map.set(row.id as string, Number(row.strength_rating));
  }
  return map;
}

async function fetchMatchTypeAggregates(): Promise<
  Map<string, Map<string, { wins: number; total: number }>>
> {
  const supabase = createClient();
  const byPlayer = new Map<string, Map<string, { wins: number; total: number }>>();

  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select("id, match_type, winner")
    .in("status", ["verified", "completed"])
    .not("winner", "is", null);

  if (matchError || !matches?.length) return byPlayer;

  const matchMeta = new Map(
    matches.map((m) => [
      m.id as string,
      { matchType: m.match_type as string, winner: m.winner as string },
    ])
  );

  const { data: rows, error } = await supabase
    .from("match_players")
    .select("player_id, team, match_id")
    .in("match_id", [...matchMeta.keys()]);

  if (error || !rows) return byPlayer;

  for (const row of rows) {
    const meta = matchMeta.get(row.match_id as string);
    if (!meta) continue;

    const playerId = row.player_id as string;
    const team = row.team as string;
    let playerMap = byPlayer.get(playerId);
    if (!playerMap) {
      playerMap = new Map();
      byPlayer.set(playerId, playerMap);
    }
    const entry = playerMap.get(meta.matchType) ?? { wins: 0, total: 0 };
    entry.total += 1;
    if (meta.winner === team) entry.wins += 1;
    playerMap.set(meta.matchType, entry);
  }

  return byPlayer;
}

/** Leaderboard rows from the `player_rankings` SQL view. */
export async function fetchPlayerRankings(
  currentUserId?: string
): Promise<LeaderboardPlayer[]> {
  const supabase = createClient();

  const [{ data, error }, typeAggregates, strengthMap] = await Promise.all([
    supabase
      .from("player_rankings")
      .select(
        `
        id,
        full_name,
        avatar_url,
        city,
        role,
        skill_level,
        dupr_rating,
        wins,
        total_matches,
        losses,
        win_pct,
        current_streak
      `
      )
      .eq("role", "player")
      .order("dupr_rating", { ascending: false })
      .order("full_name", { ascending: true }),
    fetchMatchTypeAggregates(),
    fetchStrengthRatings(),
  ]);

  if (error || !data) return [];

  return (data as DbPlayerRankingRow[]).map((row) =>
    mapToLeaderboardPlayer(
      row,
      typeAggregates.get(row.id) ?? new Map(),
      strengthMap.get(row.id) ?? 0,
      currentUserId
    )
  );
}
