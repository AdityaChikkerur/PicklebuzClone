export type Team = "A" | "B";

export type FaultType =
  | "kitchen"
  | "service"
  | "double_bounce"
  | "out_of_bounds";

export type MatchType = "singles" | "doubles" | "mixed";

export type MatchCategory = "friendly" | "league" | "tournament" | "practice";

export type ScoringType = "rally" | "side-out";

/** App-facing rules row — mirrors `public.match_rules`. */
export interface MatchRules {
  matchId: string;
  scoringType: ScoringType;
  targetPoints: number;
  winBy: number;
  bestOf: 3 | 5;
  doubles: boolean;
  maxTimeouts: number;
  timeoutDuration: number;
  localRules: Record<string, unknown>;
}

/** Supabase row shape for `public.match_rules`. */
export interface DbMatchRules {
  match_id: string;
  scoring_type: ScoringType;
  target_points: number;
  win_by: number;
  best_of: number;
  doubles: boolean;
  max_timeouts: number;
  timeout_duration: number;
  local_rules: Record<string, unknown>;
}

export type MatchStatus =
  | "draft"
  | "live"
  | "pending"
  | "verified"
  | "disputed"
  | "completed"
  | "cancelled"
  | "walkover";

export type MatchTypeFilter = "all" | MatchType;

export interface MatchEvent {
  id: string;
  matchId: string;
  eventType:
    | "point"
    | "fault"
    | "side_out"
    | "timeout"
    | "game_win"
    | "match_win";
  team: Team | null;
  description: string;
  scoreA: number;
  scoreB: number;
  gameNumber: number;
  createdAt: string;
}

export interface GameScore {
  gameNumber: number;
  scoreA: number;
  scoreB: number;
  winner: Team | null;
}

export interface MatchPlayer {
  id: string;
  playerId: string;
  fullName: string;
  avatarUrl: string | null;
  team: Team;
  serverNumber: 1 | 2 | null;
  /** Set when the player was added by phone but is not registered yet. */
  guestId?: string | null;
  guestPhone?: string | null;
  isGuest?: boolean;
}

export interface MatchState {
  matchId: string;
  teamAName: string;
  teamBName: string;
  matchType: MatchType;
  scoringType: ScoringType;
  targetPoints: number;
  bestOf: 3 | 5;
  winBy: 1 | 2;
  maxTimeouts: number;
  timeoutDuration: number;
  scoreA: number;
  scoreB: number;
  currentGame: number;
  gameScores: GameScore[];
  servingTeam: Team;
  serverNumber: 1 | 2;
  timeoutsA: number;
  timeoutsB: number;
  activeTimeout: Team | null;
  timeoutEndsAt: number | null;
  faultsA: Record<FaultType, number>;
  faultsB: Record<FaultType, number>;
  events: MatchEvent[];
  isMatchComplete: boolean;
  matchWinner: Team | null;
  isFirstServeOfGame: boolean;
  /** True while waiting for opponent invite acceptance. */
  isAwaitingStart?: boolean;
}

export interface MatchSetupState {
  step: 1 | 2 | 3 | 4;
  matchType: MatchType;
  matchCategory: MatchCategory;
  isPublic: boolean;
  teamAName: string;
  teamBName: string;
  players: MatchPlayer[];
  venue: string;
  courtNumber: string;
  city: string;
  hasReferee: boolean;
  scoringType: ScoringType;
  targetPoints: number;
  bestOf: 3 | 5;
  winBy: 1 | 2;
  maxTimeouts: number;
  timeoutDuration: number;
  localRules: string;
}

export interface RecentMatch {
  id: string;
  opponent: string;
  score: string;
  result: "W" | "L";
  matchType: MatchType;
  venue: string;
  city: string;
  status: "Verified" | "Pending" | "Disputed";
  playedAt: string;
}

export interface MatchStats {
  pointsWonA: number;
  pointsWonB: number;
  faultsA: Record<FaultType, number>;
  faultsB: Record<FaultType, number>;
  timeoutsUsedA: number;
  timeoutsUsedB: number;
  durationMinutes: number;
  /** False when the match finished too quickly to count as official. */
  timingValid?: boolean;
}

export interface MatchDetail {
  id: string;
  teamAName: string;
  teamBName: string;
  matchType: MatchType;
  matchCategory: MatchCategory;
  venue: string;
  city: string;
  status: MatchStatus;
  winner: Team | null;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
  startedAt?: string | null;
  gameScores: GameScore[];
  players: MatchPlayer[];
  events: MatchEvent[];
  stats: MatchStats;
  localRules: string;
  isCurrentUserCreator: boolean;
  isCurrentUserOpponent: boolean;
  bestPerformer: string;
  hasComeback: boolean;
}

export const DEFAULT_FAULTS: Record<FaultType, number> = {
  kitchen: 0,
  service: 0,
  double_bounce: 0,
  out_of_bounds: 0,
};

export const INITIAL_MATCH_SETUP: MatchSetupState = {
  step: 1,
  matchType: "doubles",
  matchCategory: "friendly",
  isPublic: true,
  teamAName: "Team A",
  teamBName: "Team B",
  players: [],
  venue: "",
  courtNumber: "",
  city: "",
  hasReferee: false,
  scoringType: "rally",
  targetPoints: 11,
  bestOf: 3,
  winBy: 2,
  maxTimeouts: 2,
  timeoutDuration: 60,
  localRules: "",
};
