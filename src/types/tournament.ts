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
  categoryType: CategoryType;
  skillLevel: SkillLevel;
  maxTeams: number;
  entryFee: number;
}

export interface TournamentForm {
  step: 1 | 2 | 3 | 4;
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

export type FixtureStatus = "scheduled" | "live" | "completed";

export interface TournamentDetail extends UpcomingTournament {
  description: string;
  address: string;
  isPublic: boolean;
  createdBy: string;
  prize?: string;
  sponsors?: string[];
  weather?: string;
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
