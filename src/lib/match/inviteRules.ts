import type { MatchType } from "@/types/match";

export interface InvitePlayerRow {
  playerId: string | null;
  team: "A" | "B";
  inviteStatus: string;
  isGuest?: boolean;
}

export function resolveCreatorTeam(
  createdBy: string,
  players: InvitePlayerRow[]
): "A" | "B" | null {
  const creatorRow = players.find((p) => p.playerId === createdBy);
  return creatorRow?.team ?? null;
}

/** True when invite requirements are met and scoring can begin. */
export function areMatchInvitesSatisfied(input: {
  matchType: MatchType | string;
  createdBy: string;
  players: InvitePlayerRow[];
}): boolean {
  const registered = input.players.filter((p) => p.playerId && !p.isGuest);
  if (registered.length === 0) return true;

  if (input.matchType === "singles") {
    return registered.every((p) => p.inviteStatus === "accepted");
  }

  const creatorTeam = resolveCreatorTeam(input.createdBy, registered);
  if (!creatorTeam) return false;

  return registered.some(
    (p) => p.team !== creatorTeam && p.inviteStatus === "accepted"
  );
}

export function isDoublesMatchType(matchType: MatchType | string): boolean {
  return matchType === "doubles" || matchType === "mixed";
}

export function inviteWaitingMessage(matchType: MatchType | string): string {
  if (isDoublesMatchType(matchType)) {
    return "At least one opponent must accept before scoring begins. Only then will the match count toward ratings.";
  }
  return "Both players must accept before scoring begins. Only then will the match count toward ratings.";
}

export function inviteAcceptMessage(matchType: MatchType | string): string {
  if (isDoublesMatchType(matchType)) {
    return "Accept to confirm your team is playing. The match starts once an opponent accepts.";
  }
  return "Accept to confirm you're playing. The match starts only after both players accept.";
}
