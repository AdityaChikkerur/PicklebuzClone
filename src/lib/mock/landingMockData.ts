import type { AdminTournamentRow } from "@/types/admin";

export interface LandingLiveMatch {
  id: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  gameNumber: number;
  venue: string;
  city: string;
  matchType: string;
}

export function getFeaturedTournamentsForLanding(): AdminTournamentRow[] {
  return [];
}

export function getLandingLiveMatches(): LandingLiveMatch[] {
  return [];
}
