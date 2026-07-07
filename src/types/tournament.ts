import type { ScoringType } from "./match";
import type { SkillLevel } from "./player";

export type CategoryType = "singles" | "doubles" | "mixed";

export type TournamentStatus =
  | "draft"
  | "upcoming"
  | "live"
  | "completed"
  | "cancelled";

export type TournamentFormat =
  | "knockout"
  | "round_robin"
  | "league"
  | "group_knockout";

export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface TournamentCategory {
  id: string;
  /** Display label, e.g. "Pro Mens Doubles". Falls back to type + skill level. */
  name?: string;
  categoryType: CategoryType;
  skillLevel: SkillLevel;
  maxTeams: number;
  entryFee: number;
}

export function getCategoryDisplayName(
  cat: Pick<TournamentCategory, "name" | "categoryType" | "skillLevel">
): string {
  if (cat.name?.trim()) return cat.name.trim();
  return `${CATEGORY_TYPE_LABELS[cat.categoryType]} · ${cat.skillLevel}`;
}

export interface TournamentForm {
  step: 1 | 2 | 3 | 4;
  format: TournamentFormat;
  name: string;
  description: string;
  isPublic: boolean;
  venue: string;
  city: string;
  address: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  categories: TournamentCategory[];
  scoringType: ScoringType;
  pointsToWin: number;
  bestOf: 3 | 5;
  winBy: 1 | 2;
  maxTimeouts: number;
  timeoutDuration: number;
}

export interface UpcomingTournament {
  id: string;
  name: string;
  city: string;
  venue: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  registeredCount: number;
  status: TournamentStatus;
  format?: TournamentFormat;
}

export const INITIAL_TOURNAMENT_FORM: TournamentForm = {
  step: 1,
  format: "knockout",
  name: "",
  description: "",
  isPublic: true,
  venue: "",
  city: "",
  address: "",
  maxParticipants: 32,
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  categories: [],
  scoringType: "rally",
  pointsToWin: 11,
  bestOf: 3,
  winBy: 2,
  maxTimeouts: 2,
  timeoutDuration: 60,
};

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  singles: "Singles",
  doubles: "Doubles",
  mixed: "Mixed Doubles",
};

export const TOURNAMENT_FORMAT_LABELS: Record<TournamentFormat, string> = {
  knockout: "Knockout",
  round_robin: "Round Robin",
  league: "League",
  group_knockout: "Group + Knockout",
};

export type FixtureOutcome =
  | "walkover"
  | "no_show"
  | "cancelled"
  | "abandoned";

export type FixtureStatus =
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled"
  | "walkover"
  | "no_show"
  | "abandoned";

export type CategoryTypeFilter = "all" | CategoryType;

export interface TournamentDetail extends UpcomingTournament {
  description: string;
  address: string;
  isPublic: boolean;
  createdBy: string;
  prize?: string;
  sponsors?: string[];
  weather?: string;
  /** External registration page (e.g. Global Sports). */
  registrationUrl?: string;
  /** Linked club/venue in PickleBuzz. */
  clubId?: string;
  categories: TournamentCategory[];
  scoringType: ScoringType;
  pointsToWin: number;
  bestOf: 3 | 5;
  winBy: 1 | 2;
  maxTimeouts: number;
  timeoutDuration: number;
  isOrganizer: boolean;
  userRegistration?: UserTournamentRegistration | null;
}

export interface UserTournamentRegistration {
  id: string;
  categoryId: string;
  status: RegistrationStatus;
  partnerName?: string;
  registeredAt: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  categoryId: string;
  playerId: string;
  playerName: string;
  playerAvatarUrl: string;
  partnerId?: string;
  partnerName?: string;
  partnerAvatarUrl?: string;
  seed?: number;
  status: RegistrationStatus;
  registeredAt: string;
}

export interface TournamentFixture {
  id: string;
  tournamentId: string;
  categoryId: string;
  round: string;
  matchId?: string;
  teamA: string;
  teamB: string;
  score?: string;
  status: FixtureStatus;
  isUpset?: boolean;
  scheduledAt?: string;
  court?: string;
  outcome?: FixtureOutcome;
  outcomeWinner?: "A" | "B";
  outcomeNotes?: string;
  categoryType?: CategoryType;
}

export interface PointsTableRow {
  id: string;
  tournamentId: string;
  categoryId: string;
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifference: number;
  ranking: number;
}

export interface BracketMatch {
  id: string;
  round: string;
  position: number;
  teamA: string | null;
  teamB: string | null;
  seedA?: number;
  seedB?: number;
  score?: string;
  winner?: "A" | "B";
  matchId?: string;
  isUpset?: boolean;
  status: FixtureStatus;
}

export type TournamentTab =
  | "overview"
  | "fixtures"
  | "bracket"
  | "points"
  | "participants"
  | "live"
  | "results";
