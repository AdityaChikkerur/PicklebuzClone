import type { MatchSetupState } from "@/types/match";
import { isUuid } from "@/lib/db/config";

export function playersPerTeam(matchType: MatchSetupState["matchType"]): number {
  return matchType === "singles" ? 1 : 2;
}

export function isStep1Valid(_state: MatchSetupState): boolean {
  return true;
}

export function isStep2Valid(state: MatchSetupState): boolean {
  const perTeam = playersPerTeam(state.matchType);
  const teamA = state.players.filter((p) => p.team === "A").length;
  const teamB = state.players.filter((p) => p.team === "B").length;

  return (
    state.teamAName.trim().length > 0 &&
    state.teamBName.trim().length > 0 &&
    teamA === perTeam &&
    teamB === perTeam
  );
}

/** True when at least one slot is filled by someone other than the creator. */
export function hasOpponentSelected(
  state: MatchSetupState,
  creatorId?: string | null
): boolean {
  if (!creatorId) return state.players.length > 0;

  return state.players.some((p) => {
    if (p.isGuest) return true;
    return isUuid(p.playerId) && p.playerId !== creatorId;
  });
}

export function isStep3Valid(state: MatchSetupState): boolean {
  return state.venue.trim().length > 0 && state.city.trim().length > 0;
}

export function isStep4Valid(state: MatchSetupState): boolean {
  return (
    state.targetPoints >= 1 &&
    state.targetPoints <= 99 &&
    state.maxTimeouts >= 0 &&
    state.maxTimeouts <= 5 &&
    state.timeoutDuration >= 30 &&
    state.timeoutDuration <= 300
  );
}

export function isStepValid(step: MatchSetupState["step"], state: MatchSetupState): boolean {
  switch (step) {
    case 1:
      return isStep1Valid(state);
    case 2:
      return isStep2Valid(state);
    case 3:
      return isStep3Valid(state);
    case 4:
      return isStep4Valid(state);
    default:
      return false;
  }
}
