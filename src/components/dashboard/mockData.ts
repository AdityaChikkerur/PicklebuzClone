import type { RecentMatch } from "@/types/match";
import type { RankedPlayer } from "@/types/player";
import type { UpcomingTournament } from "@/types/tournament";
import { avatarUrl } from "@/lib/utils";

export interface DashboardKpis {
  duprRating: number;
  duprChange: number;
  winRate: number;
  winStreak: number;
  matchesPlayed: number;
  tournamentWins: number;
  faultRate: number;
}

export interface WeeklyPerformance {
  week: string;
  wins: number;
  losses: number;
  rating: number;
  singles: number;
  doubles: number;
  mixed: number;
}

export const DASHBOARD_KPIS: DashboardKpis = {
  duprRating: 4.12,
  duprChange: 0.18,
  winRate: 68,
  winStreak: 5,
  matchesPlayed: 47,
  tournamentWins: 3,
  faultRate: 12,
};

export const CURRENT_FORM: ("W" | "L")[] = [
  "W",
  "W",
  "L",
  "W",
  "W",
  "W",
  "L",
  "W",
  "W",
  "L",
];

export const RECENT_MATCHES: RecentMatch[] = [
  {
    id: "m1",
    opponent: "Priya Sharma",
    score: "11-7, 11-9",
    result: "W",
    matchType: "doubles",
    venue: "Game Theory",
    city: "Bangalore",
    status: "Verified",
    playedAt: "2026-06-20T10:30:00Z",
  },
  {
    id: "m2",
    opponent: "Rohan Desai",
    score: "11-8, 9-11, 11-6",
    result: "W",
    matchType: "singles",
    venue: "Pickle Park",
    city: "Bangalore",
    status: "Verified",
    playedAt: "2026-06-18T17:00:00Z",
  },
  {
    id: "m3",
    opponent: "Ananya Iyer",
    score: "8-11, 11-9, 7-11",
    result: "L",
    matchType: "mixed",
    venue: "Court Central",
    city: "Bangalore",
    status: "Pending",
    playedAt: "2026-06-15T09:00:00Z",
  },
  {
    id: "m4",
    opponent: "Vikram Patel",
    score: "11-4, 11-6",
    result: "W",
    matchType: "doubles",
    venue: "Urban Courts",
    city: "Bangalore",
    status: "Verified",
    playedAt: "2026-06-12T19:30:00Z",
  },
  {
    id: "m5",
    opponent: "Sneha Reddy",
    score: "11-9, 11-7",
    result: "W",
    matchType: "singles",
    venue: "Game Theory",
    city: "Bangalore",
    status: "Verified",
    playedAt: "2026-06-10T11:00:00Z",
  },
  {
    id: "m6",
    opponent: "Karthik Nair",
    score: "6-11, 11-8, 9-11",
    result: "L",
    matchType: "doubles",
    venue: "Pickle Park",
    city: "Bangalore",
    status: "Disputed",
    playedAt: "2026-06-07T16:00:00Z",
  },
  {
    id: "m7",
    opponent: "Meera Joshi",
    score: "11-5, 11-8",
    result: "W",
    matchType: "mixed",
    venue: "Court Central",
    city: "Bangalore",
    status: "Verified",
    playedAt: "2026-06-04T08:30:00Z",
  },
  {
    id: "m8",
    opponent: "Aditya Singh",
    score: "11-10, 11-7",
    result: "W",
    matchType: "singles",
    venue: "Urban Courts",
    city: "Bangalore",
    status: "Verified",
    playedAt: "2026-06-01T18:00:00Z",
  },
];

export const WEEKLY_PERFORMANCE: WeeklyPerformance[] = [
  { week: "Apr 1", wins: 3, losses: 2, rating: 3.88, singles: 2, doubles: 2, mixed: 1 },
  { week: "Apr 8", wins: 4, losses: 1, rating: 3.92, singles: 1, doubles: 3, mixed: 1 },
  { week: "Apr 15", wins: 2, losses: 3, rating: 3.89, singles: 2, doubles: 1, mixed: 2 },
  { week: "Apr 22", wins: 5, losses: 0, rating: 3.96, singles: 2, doubles: 2, mixed: 1 },
  { week: "Apr 29", wins: 3, losses: 2, rating: 3.98, singles: 1, doubles: 2, mixed: 2 },
  { week: "May 6", wins: 4, losses: 1, rating: 4.02, singles: 3, doubles: 1, mixed: 1 },
  { week: "May 13", wins: 3, losses: 2, rating: 4.04, singles: 2, doubles: 2, mixed: 1 },
  { week: "May 20", wins: 5, losses: 1, rating: 4.06, singles: 2, doubles: 3, mixed: 1 },
  { week: "May 27", wins: 4, losses: 2, rating: 4.08, singles: 1, doubles: 3, mixed: 2 },
  { week: "Jun 3", wins: 5, losses: 0, rating: 4.09, singles: 2, doubles: 2, mixed: 1 },
  { week: "Jun 10", wins: 4, losses: 1, rating: 4.11, singles: 2, doubles: 2, mixed: 1 },
  { week: "Jun 17", wins: 3, losses: 1, rating: 4.12, singles: 1, doubles: 2, mixed: 1 },
];

export const CITY_RANKINGS: RankedPlayer[] = [
  {
    id: "p1",
    rank: 1,
    fullName: "Priya Sharma",
    avatarUrl: avatarUrl("priya-sharma"),
    city: "Bangalore",
    skillLevel: "4.5",
    duprRating: 4.65,
    wins: 58,
    losses: 12,
    winPct: 83,
    currentStreak: 8,
  },
  {
    id: "p2",
    rank: 2,
    fullName: "Rohan Desai",
    avatarUrl: avatarUrl("rohan-desai"),
    city: "Bangalore",
    skillLevel: "4.5",
    duprRating: 4.52,
    wins: 51,
    losses: 18,
    winPct: 74,
    currentStreak: 3,
  },
  {
    id: "p3",
    rank: 3,
    fullName: "Ananya Iyer",
    avatarUrl: avatarUrl("ananya-iyer"),
    city: "Bangalore",
    skillLevel: "4.0",
    duprRating: 4.41,
    wins: 44,
    losses: 16,
    winPct: 73,
    currentStreak: 5,
  },
  {
    id: "p4",
    rank: 4,
    fullName: "Arjun Mehta",
    avatarUrl: avatarUrl("arjun-mehta"),
    city: "Bangalore",
    skillLevel: "4.0",
    duprRating: 4.12,
    wins: 32,
    losses: 15,
    winPct: 68,
    currentStreak: 5,
    isCurrentUser: true,
  },
  {
    id: "p5",
    rank: 5,
    fullName: "Vikram Patel",
    avatarUrl: avatarUrl("vikram-patel"),
    city: "Bangalore",
    skillLevel: "4.0",
    duprRating: 4.05,
    wins: 38,
    losses: 20,
    winPct: 66,
    currentStreak: 1,
  },
  {
    id: "p6",
    rank: 6,
    fullName: "Sneha Reddy",
    avatarUrl: avatarUrl("sneha-reddy"),
    city: "Bangalore",
    skillLevel: "3.5",
    duprRating: 3.98,
    wins: 29,
    losses: 17,
    winPct: 63,
    currentStreak: 2,
  },
];

export const UPCOMING_TOURNAMENTS: UpcomingTournament[] = [
  {
    id: "t1",
    name: "Bangalore Summer Open",
    city: "Bangalore",
    venue: "Game Theory",
    startDate: "2026-07-05",
    endDate: "2026-07-07",
    registrationDeadline: "2026-06-28",
    maxParticipants: 64,
    registeredCount: 48,
    status: "upcoming",
    format: "knockout",
  },
  {
    id: "t2",
    name: "Karnataka Doubles League",
    city: "Bangalore",
    venue: "Pickle Park",
    startDate: "2026-07-18",
    endDate: "2026-08-22",
    registrationDeadline: "2026-07-10",
    maxParticipants: 32,
    registeredCount: 22,
    status: "upcoming",
    format: "round_robin",
  },
  {
    id: "t3",
    name: "Monsoon Mixed Masters",
    city: "Bangalore",
    venue: "Court Central",
    startDate: "2026-08-02",
    endDate: "2026-08-03",
    registrationDeadline: "2026-07-25",
    maxParticipants: 48,
    registeredCount: 31,
    status: "upcoming",
    format: "group_knockout",
  },
];
