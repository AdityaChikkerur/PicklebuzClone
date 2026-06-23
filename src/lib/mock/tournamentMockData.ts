import type {
  BracketMatch,
  PointsTableRow,
  TournamentDetail,
  TournamentFixture,
  TournamentRegistration,
} from "@/types/tournament";
import type { OrganizerPendingApproval } from "@/types/admin";
import { avatarUrl } from "@/lib/utils";

const RR_CATEGORIES = [
  {
    id: "cat-rr-singles",
    categoryType: "singles" as const,
    skillLevel: "4.0" as const,
    maxTeams: 8,
    entryFee: 500,
  },
  {
    id: "cat-rr-doubles",
    categoryType: "doubles" as const,
    skillLevel: "3.5" as const,
    maxTeams: 8,
    entryFee: 800,
  },
];

const KO_CATEGORIES = [
  {
    id: "cat-ko-singles",
    categoryType: "singles" as const,
    skillLevel: "4.5" as const,
    maxTeams: 16,
    entryFee: 750,
  },
  {
    id: "cat-ko-doubles",
    categoryType: "doubles" as const,
    skillLevel: "4.0" as const,
    maxTeams: 16,
    entryFee: 1200,
  },
];

const GK_CATEGORIES = [
  {
    id: "cat-gk-mixed",
    categoryType: "mixed" as const,
    skillLevel: "3.5" as const,
    maxTeams: 12,
    entryFee: 900,
  },
];

function baseRules() {
  return {
    scoringType: "rally" as const,
    pointsToWin: 11,
    bestOf: 3 as const,
    winBy: 2 as const,
    maxTimeouts: 2,
    timeoutDuration: 60,
  };
}

const TOURNAMENT_DETAILS: Record<string, TournamentDetail> = {
  "t-rr-1": {
    id: "t-rr-1",
    name: "Bangalore Summer League",
    description:
      "Six-week round-robin league across singles and doubles divisions. Top teams qualify for the season finals.",
    city: "Bangalore",
    venue: "Smash Arena",
    address: "100 Feet Road, Indiranagar, Bangalore",
    startDate: "2026-07-06",
    endDate: "2026-07-13",
    registrationDeadline: "2026-06-29",
    maxParticipants: 32,
    registeredCount: 24,
    status: "upcoming",
    format: "round_robin",
    isPublic: true,
    createdBy: "organizer-1",
    prize: "₹50,000 prize pool",
    sponsors: ["Yonex", "DUPR India"],
    weather: "28°C · Partly cloudy",
    categories: RR_CATEGORIES,
    ...baseRules(),
    isOrganizer: false,
    userRegistration: {
      id: "reg-user-1",
      categoryId: "cat-rr-doubles",
      status: "approved",
      partnerName: "Priya Sharma",
      registeredAt: "2026-06-18T10:00:00Z",
    },
  },
  "t-ko-1": {
    id: "t-ko-1",
    name: "Mumbai Knockout Open",
    description:
      "Single-elimination championship with seeded brackets. Every match is best-of-three rally scoring.",
    city: "Mumbai",
    venue: "Pickle Park",
    address: "Linking Road, Bandra West, Mumbai",
    startDate: "2026-07-22",
    endDate: "2026-07-24",
    registrationDeadline: "2026-07-12",
    maxParticipants: 64,
    registeredCount: 41,
    status: "upcoming",
    format: "knockout",
    isPublic: true,
    createdBy: "current-user",
    prize: "₹1,00,000 winner's purse",
    sponsors: ["Head", "PickleBuzz"],
    weather: "31°C · Humid",
    categories: KO_CATEGORIES,
    ...baseRules(),
    isOrganizer: true,
    userRegistration: null,
  },
  t1: {
    id: "t1",
    name: "Bangalore Summer Open",
    description: "Premier knockout open for advanced singles and doubles players.",
    city: "Bangalore",
    venue: "Smash Arena",
    address: "100 Feet Road, Indiranagar, Bangalore",
    startDate: "2026-07-05",
    endDate: "2026-07-07",
    registrationDeadline: "2026-06-28",
    maxParticipants: 64,
    registeredCount: 48,
    status: "upcoming",
    format: "knockout",
    isPublic: true,
    createdBy: "organizer-2",
    prize: "₹75,000",
    sponsors: ["Wilson"],
    weather: "27°C · Clear",
    categories: KO_CATEGORIES,
    ...baseRules(),
    isOrganizer: false,
    userRegistration: null,
  },
  t2: {
    id: "t2",
    name: "Karnataka Doubles League",
    description: "Month-long doubles league with weekly round-robin fixtures.",
    city: "Bangalore",
    venue: "Pickle Park",
    address: "Koramangala 5th Block, Bangalore",
    startDate: "2026-07-18",
    endDate: "2026-08-22",
    registrationDeadline: "2026-07-10",
    maxParticipants: 32,
    registeredCount: 22,
    status: "upcoming",
    format: "round_robin",
    isPublic: true,
    createdBy: "organizer-1",
    prize: "₹30,000",
    sponsors: [],
    weather: "26°C · Light rain",
    categories: RR_CATEGORIES,
    ...baseRules(),
    isOrganizer: false,
    userRegistration: null,
  },
  t3: {
    id: "t3",
    name: "Monsoon Mixed Masters",
    description:
      "Group stage round-robin followed by knockout semifinals and final for mixed doubles teams.",
    city: "Bangalore",
    venue: "Court Central",
    address: "MG Road, Bangalore",
    startDate: "2026-08-02",
    endDate: "2026-08-03",
    registrationDeadline: "2026-07-25",
    maxParticipants: 48,
    registeredCount: 31,
    status: "upcoming",
    format: "group_knockout",
    isPublic: true,
    createdBy: "organizer-3",
    prize: "₹40,000",
    sponsors: ["Joola"],
    weather: "25°C · Overcast",
    categories: GK_CATEGORIES,
    ...baseRules(),
    isOrganizer: false,
    userRegistration: null,
  },
};

const REGISTRATIONS: Record<string, TournamentRegistration[]> = {
  "t-rr-1": [
    {
      id: "r1",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      playerId: "current-user",
      playerName: "Arjun Mehta",
      playerAvatarUrl: avatarUrl("arjun-mehta"),
      partnerId: "p2",
      partnerName: "Priya Sharma",
      partnerAvatarUrl: avatarUrl("priya-sharma"),
      seed: 3,
      status: "approved",
      registeredAt: "2026-06-18T10:00:00Z",
    },
    {
      id: "r2",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      playerId: "p3",
      playerName: "Rohan Desai",
      playerAvatarUrl: avatarUrl("rohan-desai"),
      partnerId: "p4",
      partnerName: "Ananya Iyer",
      partnerAvatarUrl: avatarUrl("ananya-iyer"),
      seed: 1,
      status: "approved",
      registeredAt: "2026-06-17T09:00:00Z",
    },
    {
      id: "r3",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      playerId: "p5",
      playerName: "Vikram Patel",
      playerAvatarUrl: avatarUrl("vikram-patel"),
      partnerId: "p6",
      partnerName: "Sneha Reddy",
      partnerAvatarUrl: avatarUrl("sneha-reddy"),
      seed: 2,
      status: "approved",
      registeredAt: "2026-06-16T14:00:00Z",
    },
    {
      id: "r4",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-singles",
      playerId: "p7",
      playerName: "Karan Patel",
      playerAvatarUrl: avatarUrl("karan"),
      status: "pending",
      registeredAt: "2026-06-22T08:00:00Z",
    },
    {
      id: "r5",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-singles",
      playerId: "p8",
      playerName: "Meera Joshi",
      playerAvatarUrl: avatarUrl("meera"),
      status: "approved",
      seed: 1,
      registeredAt: "2026-06-15T11:00:00Z",
    },
  ],
  "t-ko-1": [
    {
      id: "k1",
      tournamentId: "t-ko-1",
      categoryId: "cat-ko-singles",
      playerId: "p1",
      playerName: "Priya Sharma",
      playerAvatarUrl: avatarUrl("priya-sharma"),
      seed: 1,
      status: "approved",
      registeredAt: "2026-06-20T10:00:00Z",
    },
    {
      id: "k2",
      tournamentId: "t-ko-1",
      categoryId: "cat-ko-singles",
      playerId: "p3",
      playerName: "Rohan Desai",
      playerAvatarUrl: avatarUrl("rohan-desai"),
      seed: 2,
      status: "approved",
      registeredAt: "2026-06-19T10:00:00Z",
    },
    {
      id: "k3",
      tournamentId: "t-ko-1",
      categoryId: "cat-ko-singles",
      playerId: "p9",
      playerName: "Aditya Singh",
      playerAvatarUrl: avatarUrl("aditya"),
      seed: 8,
      status: "approved",
      registeredAt: "2026-06-18T10:00:00Z",
    },
    {
      id: "k4",
      tournamentId: "t-ko-1",
      categoryId: "cat-ko-singles",
      playerId: "p10",
      playerName: "Divya Krishnan",
      playerAvatarUrl: avatarUrl("divya"),
      status: "pending",
      registeredAt: "2026-06-22T07:00:00Z",
    },
    {
      id: "k5",
      tournamentId: "t-ko-1",
      categoryId: "cat-ko-doubles",
      playerId: "p2",
      playerName: "Ananya Iyer",
      playerAvatarUrl: avatarUrl("ananya-iyer"),
      partnerId: "p5",
      partnerName: "Vikram Patel",
      partnerAvatarUrl: avatarUrl("vikram-patel"),
      seed: 4,
      status: "approved",
      registeredAt: "2026-06-17T12:00:00Z",
    },
  ],
};

const POINTS_TABLES: Record<string, PointsTableRow[]> = {
  "t-rr-1": [
    {
      id: "pt1",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      teamId: "team-rohan",
      teamName: "Rohan & Ananya",
      played: 3,
      wins: 3,
      losses: 0,
      pointsFor: 66,
      pointsAgainst: 42,
      pointDifference: 24,
      ranking: 1,
    },
    {
      id: "pt2",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      teamId: "team-vikram",
      teamName: "Vikram & Sneha",
      played: 3,
      wins: 2,
      losses: 1,
      pointsFor: 58,
      pointsAgainst: 51,
      pointDifference: 7,
      ranking: 2,
    },
    {
      id: "pt3",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      teamId: "team-arjun",
      teamName: "Arjun & Priya",
      played: 3,
      wins: 1,
      losses: 2,
      pointsFor: 49,
      pointsAgainst: 55,
      pointDifference: -6,
      ranking: 3,
    },
    {
      id: "pt4",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      teamId: "team-karan",
      teamName: "Karan & Lakshmi",
      played: 3,
      wins: 0,
      losses: 3,
      pointsFor: 38,
      pointsAgainst: 63,
      pointDifference: -25,
      ranking: 4,
    },
  ],
  t3: [
    {
      id: "gpt1",
      tournamentId: "t3",
      categoryId: "cat-gk-mixed",
      teamId: "g1",
      teamName: "Group A — Arjun & Priya",
      played: 2,
      wins: 2,
      losses: 0,
      pointsFor: 44,
      pointsAgainst: 30,
      pointDifference: 14,
      ranking: 1,
    },
    {
      id: "gpt2",
      tournamentId: "t3",
      categoryId: "cat-gk-mixed",
      teamId: "g2",
      teamName: "Group A — Rohan & Sneha",
      played: 2,
      wins: 1,
      losses: 1,
      pointsFor: 40,
      pointsAgainst: 38,
      pointDifference: 2,
      ranking: 2,
    },
    {
      id: "gpt3",
      tournamentId: "t3",
      categoryId: "cat-gk-mixed",
      teamId: "g3",
      teamName: "Group B — Vikram & Meera",
      played: 2,
      wins: 2,
      losses: 0,
      pointsFor: 42,
      pointsAgainst: 28,
      pointDifference: 14,
      ranking: 1,
    },
  ],
};

const FIXTURES: Record<string, TournamentFixture[]> = {
  "t-rr-1": [
    {
      id: "f1",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      round: "RR",
      matchId: "m1",
      teamA: "Arjun & Priya",
      teamB: "Rohan & Ananya",
      score: "11-9, 8-11, 11-7",
      status: "completed",
      scheduledAt: "2026-07-06T09:00:00Z",
      court: "Court 1",
    },
    {
      id: "f2",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      round: "RR",
      teamA: "Vikram & Sneha",
      teamB: "Karan & Lakshmi",
      score: "11-5, 11-8",
      status: "completed",
      scheduledAt: "2026-07-06T10:30:00Z",
      court: "Court 2",
    },
    {
      id: "f3",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      round: "RR",
      teamA: "Arjun & Priya",
      teamB: "Vikram & Sneha",
      status: "live",
      score: "11-8, 6-4",
      scheduledAt: "2026-07-07T09:00:00Z",
      court: "Court 1",
    },
    {
      id: "f4",
      tournamentId: "t-rr-1",
      categoryId: "cat-rr-doubles",
      round: "RR",
      teamA: "Rohan & Ananya",
      teamB: "Karan & Lakshmi",
      status: "scheduled",
      scheduledAt: "2026-07-07T11:00:00Z",
      court: "Court 3",
    },
  ],
  "t-ko-1": [
    {
      id: "kf1",
      tournamentId: "t-ko-1",
      categoryId: "cat-ko-singles",
      round: "QF",
      matchId: "m-ko-1",
      teamA: "Priya Sharma (#1)",
      teamB: "Aditya Singh (#8)",
      score: "11-6, 11-4",
      status: "completed",
      isUpset: false,
      scheduledAt: "2026-07-22T09:00:00Z",
      court: "Centre Court",
    },
    {
      id: "kf2",
      tournamentId: "t-ko-1",
      categoryId: "cat-ko-singles",
      round: "QF",
      teamA: "Rohan Desai (#2)",
      teamB: "Harsh Joshi (#7)",
      score: "9-11, 11-8, 11-9",
      status: "completed",
      isUpset: true,
      scheduledAt: "2026-07-22T10:00:00Z",
      court: "Court 2",
    },
    {
      id: "kf3",
      tournamentId: "t-ko-1",
      categoryId: "cat-ko-singles",
      round: "SF",
      teamA: "Priya Sharma",
      teamB: "Harsh Joshi",
      status: "scheduled",
      scheduledAt: "2026-07-23T09:00:00Z",
      court: "Centre Court",
    },
  ],
};

const BRACKETS: Record<string, BracketMatch[]> = {
  "t-ko-1": [
    {
      id: "b-qf1",
      round: "QF",
      position: 0,
      teamA: "Priya Sharma",
      teamB: "Aditya Singh",
      seedA: 1,
      seedB: 8,
      score: "11-6, 11-4",
      winner: "A",
      matchId: "m-ko-1",
      status: "completed",
    },
    {
      id: "b-qf2",
      round: "QF",
      position: 1,
      teamA: "Rohan Desai",
      teamB: "Harsh Joshi",
      seedA: 2,
      seedB: 7,
      score: "9-11, 11-8, 11-9",
      winner: "B",
      isUpset: true,
      status: "completed",
    },
    {
      id: "b-qf3",
      round: "QF",
      position: 2,
      teamA: "Ananya Iyer",
      teamB: "Karan Patel",
      seedA: 3,
      seedB: 6,
      score: "11-7, 11-9",
      winner: "A",
      status: "completed",
    },
    {
      id: "b-qf4",
      round: "QF",
      position: 3,
      teamA: "Vikram Patel",
      teamB: "Meera Joshi",
      seedA: 4,
      seedB: 5,
      score: "11-10, 11-6",
      winner: "A",
      status: "completed",
    },
    {
      id: "b-sf1",
      round: "SF",
      position: 0,
      teamA: "Priya Sharma",
      teamB: "Harsh Joshi",
      seedA: 1,
      seedB: 7,
      status: "scheduled",
    },
    {
      id: "b-sf2",
      round: "SF",
      position: 1,
      teamA: "Ananya Iyer",
      teamB: "Vikram Patel",
      seedA: 3,
      seedB: 4,
      status: "scheduled",
    },
    {
      id: "b-final",
      round: "Final",
      position: 0,
      teamA: null,
      teamB: null,
      status: "scheduled",
    },
  ],
  t1: [
    {
      id: "t1-b1",
      round: "SF",
      position: 0,
      teamA: "Arjun Mehta",
      teamB: "Rohan Desai",
      seedA: 4,
      seedB: 1,
      status: "scheduled",
    },
    {
      id: "t1-b2",
      round: "SF",
      position: 1,
      teamA: "Priya Sharma",
      teamB: "Ananya Iyer",
      seedA: 2,
      seedB: 3,
      status: "scheduled",
    },
    {
      id: "t1-final",
      round: "Final",
      position: 0,
      teamA: null,
      teamB: null,
      status: "scheduled",
    },
  ],
};

export const DEMO_TOURNAMENT_IDS = {
  roundRobin: "t-rr-1",
  knockout: "t-ko-1",
} as const;

/** Demo tournaments owned by the organizer demo account */
const ORGANIZER_DEMO_OWNERS = new Set(["organizer-1", "current-user"]);

export function listAllTournaments(): TournamentDetail[] {
  return Object.values(TOURNAMENT_DETAILS);
}

export function getOrganizerTournaments(): TournamentDetail[] {
  return listAllTournaments().filter((t) =>
    ORGANIZER_DEMO_OWNERS.has(t.createdBy)
  );
}

export function getOrganizerPendingApprovals(): OrganizerPendingApproval[] {
  const tournaments = getOrganizerTournaments();
  const pending: OrganizerPendingApproval[] = [];

  for (const t of tournaments) {
    const regs = getTournamentRegistrations(t.id).filter(
      (r) => r.status === "pending"
    );
    for (const reg of regs) {
      const cat = t.categories.find((c) => c.id === reg.categoryId);
      pending.push({
        registrationId: reg.id,
        tournamentId: t.id,
        tournamentName: t.name,
        playerName: reg.playerName,
        partnerName: reg.partnerName,
        categoryLabel: cat
          ? `${cat.categoryType} · ${cat.skillLevel}`
          : "Category",
        registeredAt: reg.registeredAt,
      });
    }
  }

  return pending.sort(
    (a, b) =>
      new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
  );
}

export function getTournamentDetail(id: string): TournamentDetail | null {
  return TOURNAMENT_DETAILS[id] ?? null;
}

export function getTournamentRegistrations(
  tournamentId: string
): TournamentRegistration[] {
  return REGISTRATIONS[tournamentId] ?? [];
}

export function getTournamentPointsTable(
  tournamentId: string,
  categoryId?: string
): PointsTableRow[] {
  const rows = POINTS_TABLES[tournamentId] ?? [];
  if (!categoryId) return rows;
  return rows.filter((r) => r.categoryId === categoryId);
}

export function getTournamentFixtures(
  tournamentId: string,
  categoryId?: string
): TournamentFixture[] {
  const rows = FIXTURES[tournamentId] ?? [];
  if (!categoryId) return rows;
  return rows.filter((f) => f.categoryId === categoryId);
}

export function getTournamentBracket(
  tournamentId: string
): BracketMatch[] {
  return BRACKETS[tournamentId] ?? [];
}

export function getBracketRounds(tournamentId: string): string[] {
  const rounds = [...new Set(getTournamentBracket(tournamentId).map((m) => m.round))];
  const order = ["R64", "R32", "R16", "QF", "SF", "Final", "RR"];
  return rounds.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
