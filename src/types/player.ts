export type UserRole =
  | "player"
  | "organizer"
  | "referee"
  | "club_owner"
  | "admin";

export type SkillLevel =
  | "2.0"
  | "2.5"
  | "3.0"
  | "3.5"
  | "4.0"
  | "4.5"
  | "5.0+";

export const SKILL_LEVELS: SkillLevel[] = [
  "2.0",
  "2.5",
  "3.0",
  "3.5",
  "4.0",
  "4.5",
  "5.0+",
];

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "player", label: "Player" },
  { value: "organizer", label: "Organizer" },
  { value: "referee", label: "Referee" },
  { value: "club_owner", label: "Club Owner" },
  { value: "admin", label: "Admin" },
];

/** Roles users may pick during onboarding (admin is staff-assigned only). */
export const ONBOARDING_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "player", label: "Player", description: "Score matches, climb rankings" },

  { value: "club_owner", label: "Club Owner", description: "Manage courts & bookings" },
];

export interface Profile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  city: string;
  role: UserRole;
  skillLevel: SkillLevel;
  /** PickleBuzz rating — computed from verified match results. */
  playerRating: number;
  /** @deprecated Use playerRating — kept for DB column mapping */
  duprRating: number;
  phone: string;
  profileComplete: boolean;
  duprId?: string | null;
  duprSyncedAt?: string | null;
  createdAt: string;
}

export interface Player {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  city: string;
  skillLevel: SkillLevel;
  /** PickleBuzz rating (BUZZ). */
  playerRating?: number;
  /** @deprecated Use playerRating — kept for DB column mapping */
  duprRating: number;
  phone?: string | null;
  isGuest?: boolean;
  wins?: number;
  losses?: number;
  winPct?: number;
  currentStreak?: number;
  lookingForPartner?: boolean;
  lookingForMatch?: boolean;
}

export interface RankedPlayer extends Player {
  rank: number;
  wins: number;
  losses: number;
  winPct: number;
  currentStreak: number;
  isCurrentUser?: boolean;
}

export interface DemoCredential {
  email: string;
  password: string;
  role: UserRole;
  label: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    email: "player@picklebuzz.demo",
    password: "demo1234",
    role: "player",
    label: "Player",
  },
  {
    email: "organizer@picklebuzz.demo",
    password: "demo1234",
    role: "organizer",
    label: "Organizer",
  },
  {
    email: "referee@picklebuzz.demo",
    password: "demo1234",
    role: "referee",
    label: "Referee",
  },
  {
    email: "club@picklebuzz.demo",
    password: "demo1234",
    role: "club_owner",
    label: "Club Owner",
  },
  {
    email: "admin@picklebuzz.demo",
    password: "demo1234",
    role: "admin",
    label: "Admin",
  },
];
