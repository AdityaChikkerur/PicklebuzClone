import type {
  BracketMatch,
  PointsTableRow,
  TournamentDetail,
  TournamentFixture,
  TournamentRegistration,
} from "@/types/tournament";
import type { OrganizerPendingApproval } from "@/types/admin";

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
  t1: {
    id: "t1",
    name: "Bangalore Summer Open",
    description: "Premier knockout open for advanced singles and doubles players.",
    city: "Bangalore",
    venue: "Game Theory",
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

const REGISTRATIONS: Record<string, TournamentRegistration[]> = {};

const POINTS_TABLES: Record<string, PointsTableRow[]> = {
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

// const FIXTURES: Record<string, TournamentFixture[]> = {};

// const BRACKETS: Record<string, BracketMatch[]> = {
//   t1: [
//     {
//       id: "t1-b1",
//       round: "SF",
//       position: 0,
//       teamA: "Arjun Mehta",
//       teamB: "Rohan Desai",
//       seedA: 4,
//       seedB: 1,
//       status: "scheduled",
//     },
//     {
//       id: "t1-b2",
//       round: "SF",
//       position: 1,
//       teamA: "Priya Sharma",
//       teamB: "Ananya Iyer",
//       seedA: 2,
//       seedB: 3,
//       status: "scheduled",
//     },
//     {
//       id: "t1-final",
//       round: "Final",
//       position: 0,
//       teamA: null,
//       teamB: null,
//       status: "scheduled",
//     },
//   ],
// };

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

// export function getTournamentFixtures(
//   tournamentId: string,
//   categoryId?: string
// ): TournamentFixture[] {
//   const rows = FIXTURES[tournamentId] ?? [];
//   if (!categoryId) return rows;
//   return rows.filter((f) => f.categoryId === categoryId);
// }

// export function getTournamentBracket(
//   tournamentId: string
// ): BracketMatch[] {
//   return BRACKETS[tournamentId] ?? [];
// }

// export function getBracketRounds(tournamentId: string): string[] {
//   const rounds = [...new Set(getTournamentBracket(tournamentId).map((m) => m.round))];
//   const order = ["R64", "R32", "R16", "QF", "SF", "Final", "RR"];
//   return rounds.sort((a, b) => order.indexOf(a) - order.indexOf(b));
// }
