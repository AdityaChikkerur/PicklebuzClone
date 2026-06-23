import type { AdminTournamentRow } from "@/types/admin";
import type { MatchDetail } from "@/types/match";
import { buildAdminTournamentRows } from "./adminMockData";
import { MATCH_DETAILS } from "./extendedMockData";

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

function matchToLandingCard(match: MatchDetail): LandingLiveMatch {
  const lastEvent = match.events[0];
  const currentGame = match.gameScores.at(-1);

  return {
    id: match.id,
    teamAName: match.teamAName,
    teamBName: match.teamBName,
    scoreA: lastEvent?.scoreA ?? currentGame?.scoreA ?? 0,
    scoreB: lastEvent?.scoreB ?? currentGame?.scoreB ?? 0,
    gameNumber: lastEvent?.gameNumber ?? match.gameScores.length,
    venue: match.venue,
    city: match.city,
    matchType: match.matchType,
  };
}

const EXTRA_LIVE_MATCHES: LandingLiveMatch[] = [
  {
    id: "m-live-2",
    teamAName: "Net Ninjas",
    teamBName: "Dink Masters",
    scoreA: 7,
    scoreB: 5,
    gameNumber: 1,
    venue: "Pickle Park",
    city: "Mumbai",
    matchType: "doubles",
  },
  {
    id: "m-live-3",
    teamAName: "Rohan Desai",
    teamBName: "Karan Patel",
    scoreA: 10,
    scoreB: 9,
    gameNumber: 3,
    venue: "Court Central",
    city: "Bangalore",
    matchType: "singles",
  },
];

export function getFeaturedTournamentsForLanding(): AdminTournamentRow[] {
  return buildAdminTournamentRows().filter((t) => t.featured && !t.archived);
}

export function getLandingLiveMatches(): LandingLiveMatch[] {
  const liveFromMocks = Object.values(MATCH_DETAILS)
    .filter((match) => match.status === "live")
    .map(matchToLandingCard);

  return [...liveFromMocks, ...EXTRA_LIVE_MATCHES];
}
