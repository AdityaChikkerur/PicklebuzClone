import { DEMO_MATCH_IDS } from "@/lib/mock/extendedMockData";
import type {
  AdminDispute,
  AdminStats,
  AdminTournamentRow,
  AdminUser,
} from "@/types/admin";
import { EXTENDED_CLUBS } from "./extendedMockData";
import {
  getTournamentDetail,
  getTournamentRegistrations,
  listAllTournaments,
} from "./tournamentMockData";

export const MOCK_ADMIN_DISPUTES: AdminDispute[] = [
  {
    id: "disp-1",
    matchId: DEMO_MATCH_IDS.disputed,
    matchTitle: "Team Priya vs Net Ninjas",
    creatorName: "Priya Sharma",
    opponentName: "Net Ninjas",
    raisedByName: "Arjun Mehta",
    reason:
      "Final game score recorded as 9–11 but we agreed the rally ended at 8–11.",
    status: "open",
    resolution: null,
    createdAt: "2026-06-19T12:35:00Z",
  },
  {
    id: "disp-2",
    matchId: "m-old-dispute",
    matchTitle: "Rohan Desai vs Karan Patel",
    creatorName: "Rohan Desai",
    opponentName: "Karan Patel",
    raisedByName: "Karan Patel",
    reason: "Match was marked complete before the deciding game finished.",
    status: "resolved",
    resolution: "uphold_opponent",
    createdAt: "2026-06-10T16:00:00Z",
  },
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "u1",
    fullName: "Arjun Mehta",
    email: "arjun@picklebuzz.demo",
    city: "Bangalore",
    role: "player",
    skillLevel: "4.0",
    duprRating: 4.12,
    verified: true,
    banned: false,
    boosted: false,
    createdAt: "2025-11-01T10:00:00Z",
  },
  {
    id: "u2",
    fullName: "Priya Sharma",
    email: "priya@picklebuzz.demo",
    city: "Bangalore",
    role: "organizer",
    skillLevel: "4.0",
    duprRating: 4.05,
    verified: true,
    banned: false,
    boosted: true,
    createdAt: "2025-10-15T08:00:00Z",
  },
  {
    id: "u3",
    fullName: "Rohan Desai",
    email: "rohan@picklebuzz.demo",
    city: "Mumbai",
    role: "player",
    skillLevel: "3.5",
    duprRating: 3.88,
    verified: false,
    banned: false,
    boosted: false,
    createdAt: "2026-01-20T12:00:00Z",
  },
  {
    id: "u4",
    fullName: "Vikram Singh",
    email: "vikram@picklebuzz.demo",
    city: "Mumbai",
    role: "player",
    skillLevel: "4.5",
    duprRating: 4.42,
    verified: true,
    banned: false,
    boosted: false,
    createdAt: "2025-12-05T09:00:00Z",
  },
  {
    id: "u5",
    fullName: "Spam Bot",
    email: "spam@fake.demo",
    city: "Delhi",
    role: "player",
    skillLevel: "2.0",
    duprRating: 2.0,
    verified: false,
    banned: true,
    boosted: false,
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "u6",
    fullName: "Ananya Iyer",
    email: "ananya@picklebuzz.demo",
    city: "Chennai",
    role: "referee",
    skillLevel: "4.0",
    duprRating: 4.0,
    verified: true,
    banned: false,
    boosted: false,
    createdAt: "2025-09-10T14:00:00Z",
  },
  {
    id: "u7",
    fullName: "Smash Arena Owner",
    email: "club@picklebuzz.demo",
    city: "Bangalore",
    role: "club_owner",
    skillLevel: "3.5",
    duprRating: 3.5,
    verified: true,
    banned: false,
    boosted: false,
    createdAt: "2025-08-01T10:00:00Z",
  },
  {
    id: "u8",
    fullName: "Platform Admin",
    email: "admin@picklebuzz.demo",
    city: "Bangalore",
    role: "admin",
    skillLevel: "4.0",
    duprRating: 4.0,
    verified: true,
    banned: false,
    boosted: false,
    createdAt: "2025-07-01T10:00:00Z",
  },
];

const ORGANIZER_NAMES: Record<string, string> = {
  "organizer-1": "Priya Sharma",
  "organizer-2": "Mumbai Sports Co.",
  "organizer-3": "Court Central",
  "current-user": "You",
};

const FEATURED_IDS = new Set(["t-ko-1", "t-rr-1"]);
const ARCHIVED_IDS = new Set<string>();

export function buildAdminTournamentRows(): AdminTournamentRow[] {
  return listAllTournaments().map((t) => ({
    id: t.id,
    name: t.name,
    city: t.city,
    status: t.status,
    format: t.format ?? "knockout",
    registeredCount: t.registeredCount,
    maxParticipants: t.maxParticipants,
    featured: FEATURED_IDS.has(t.id),
    archived: ARCHIVED_IDS.has(t.id),
    createdByName: ORGANIZER_NAMES[t.createdBy] ?? "Unknown",
    startDate: t.startDate,
  }));
}

export function computeAdminStats(
  users: AdminUser[],
  disputes: AdminDispute[],
  tournaments: AdminTournamentRow[]
): AdminStats {
  return {
    userCount: users.filter((u) => !u.banned).length,
    tournamentCount: tournaments.filter((t) => !t.archived).length,
    clubCount: EXTENDED_CLUBS.length,
    openDisputes: disputes.filter((d) => d.status === "open").length,
  };
}

export function computeFeesCollected(tournamentIds: string[]): number {
  let total = 0;
  for (const tid of tournamentIds) {
    const tournament = getTournamentDetail(tid);
    if (!tournament) continue;
    const approved = getTournamentRegistrations(tid).filter(
      (r) => r.status === "approved"
    );
    for (const reg of approved) {
      const cat = tournament.categories.find((c) => c.id === reg.categoryId);
      if (cat) total += cat.entryFee;
    }
  }
  return total;
}

export function countUniquePlayers(tournamentIds: string[]): number {
  const ids = new Set<string>();
  for (const tid of tournamentIds) {
    for (const reg of getTournamentRegistrations(tid)) {
      ids.add(reg.playerId);
      if (reg.partnerId) ids.add(reg.partnerId);
    }
  }
  return ids.size;
}
