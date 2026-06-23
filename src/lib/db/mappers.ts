import type {
  Club,
  Court,
  CourtBooking,
  CourtBookingWithDetails,
  DbClub,
  DbCourt,
  DbCourtBooking,
} from "@/types/club";
import type {
  DbMatchRules,
  GameScore,
  MatchEvent,
  MatchRules,
  MatchStatus,
  MatchType,
  Team,
} from "@/types/match";

function asBestOf(value: number): 1 | 3 | 5 {
  if (value === 1 || value === 5) return value;
  return 3;
}

export function mapDbMatchRules(row: DbMatchRules): MatchRules {
  return {
    matchId: row.match_id,
    scoringType: row.scoring_type,
    targetPoints: row.target_points,
    winBy: row.win_by,
    bestOf: asBestOf(row.best_of),
    doubles: row.doubles,
    maxTimeouts: row.max_timeouts,
    timeoutDuration: row.timeout_duration,
    localRules: row.local_rules ?? {},
  };
}

export function matchRulesToInsert(
  matchId: string,
  rules: Partial<MatchRules> & Pick<MatchRules, "scoringType">
): DbMatchRules {
  return {
    match_id: matchId,
    scoring_type: rules.scoringType,
    target_points: rules.targetPoints ?? 11,
    win_by: rules.winBy ?? 2,
    best_of: rules.bestOf ?? 3,
    doubles: rules.doubles ?? false,
    max_timeouts: rules.maxTimeouts ?? 2,
    timeout_duration: rules.timeoutDuration ?? 60,
    local_rules: rules.localRules ?? {},
  };
}

export function mapDbClub(
  row: DbClub & { courts?: { count: number }[] }
): Club {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    city: row.city ?? "",
    location: row.location ?? "",
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    contact: row.contact ?? "",
    rating: row.rating != null ? Number(row.rating) : 0,
    courtCount: row.courts?.[0]?.count,
  };
}

export function mapDbCourt(row: DbCourt): Court {
  return {
    id: row.id,
    clubId: row.club_id,
    name: row.name,
    surface: row.surface ?? "",
    pricePerHour: row.price_per_hour ?? 0,
    openFrom: row.open_from ?? "06:00",
    openTo: row.open_to ?? "22:00",
  };
}

export function mapDbCourtBooking(row: DbCourtBooking): CourtBooking {
  return {
    id: row.id,
    courtId: row.court_id,
    playerId: row.player_id,
    startAt: row.start_at,
    endAt: row.end_at,
    status: row.status,
    amount: row.amount ?? 0,
  };
}

type DbBookingWithCourt = DbCourtBooking & {
  courts: {
    name: string;
    clubs: { name: string; city: string | null } | null;
  } | null;
};

export function mapDbCourtBookingWithDetails(
  row: DbBookingWithCourt
): CourtBookingWithDetails {
  const base = mapDbCourtBooking(row);
  return {
    ...base,
    courtName: row.courts?.name ?? "",
    clubName: row.courts?.clubs?.name ?? "",
    clubCity: row.courts?.clubs?.city ?? "",
  };
}

export interface DbMatchRow {
  id: string;
  match_type: MatchType;
  team_a_name: string;
  team_b_name: string;
  status: MatchStatus;
  winner: Team | null;
}

export interface DbGameScoreRow {
  game_number: number;
  score_a: number;
  score_b: number;
  winner: Team | null;
}

export interface DbMatchEventRow {
  id: string;
  match_id: string;
  event_type: MatchEvent["eventType"];
  team: Team | null;
  description: string;
  score_a: number;
  score_b: number;
  game_number: number;
  created_at: string;
}

export function mapDbGameScore(row: DbGameScoreRow): GameScore {
  return {
    gameNumber: row.game_number,
    scoreA: row.score_a,
    scoreB: row.score_b,
    winner: row.winner,
  };
}

export function mapDbMatchEvent(row: DbMatchEventRow): MatchEvent {
  return {
    id: row.id,
    matchId: row.match_id,
    eventType: row.event_type,
    team: row.team,
    description: row.description,
    scoreA: row.score_a,
    scoreB: row.score_b,
    gameNumber: row.game_number,
    createdAt: row.created_at,
  };
}
