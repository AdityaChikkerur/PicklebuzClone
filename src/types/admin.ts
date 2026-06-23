import type { SkillLevel, UserRole } from "./player";
import type { TournamentFormat, TournamentStatus } from "./tournament";

export type DisputeStatus = "open" | "resolved";

export type DisputeResolution =
  | "uphold_creator"
  | "uphold_opponent"
  | "resolved"
  | null;

export interface AdminDispute {
  id: string;
  matchId: string;
  matchTitle: string;
  creatorName: string;
  opponentName: string;
  raisedByName: string;
  reason: string;
  status: DisputeStatus;
  resolution: DisputeResolution;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  city: string;
  role: UserRole;
  skillLevel: SkillLevel;
  duprRating: number;
  verified: boolean;
  banned: boolean;
  boosted: boolean;
  createdAt: string;
}

export interface AdminTournamentRow {
  id: string;
  name: string;
  city: string;
  status: TournamentStatus;
  format: TournamentFormat;
  registeredCount: number;
  maxParticipants: number;
  featured: boolean;
  archived: boolean;
  createdByName: string;
  startDate: string;
}

export interface OrganizerPendingApproval {
  registrationId: string;
  tournamentId: string;
  tournamentName: string;
  playerName: string;
  partnerName?: string;
  categoryLabel: string;
  registeredAt: string;
}

export interface OrganizerStats {
  eventCount: number;
  totalPlayers: number;
  feesCollected: number;
  pendingApprovals: number;
}

export interface AdminStats {
  userCount: number;
  tournamentCount: number;
  clubCount: number;
  openDisputes: number;
}
