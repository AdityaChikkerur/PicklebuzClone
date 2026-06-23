import type { TournamentForm } from "@/types/tournament";

export function isStep1Valid(state: TournamentForm): boolean {
  const nameOk = state.name.trim().length >= 3;
  const venueOk = state.venue.trim().length > 0;
  const cityOk = state.city.trim().length > 0;
  const participantsOk = state.maxParticipants >= 4 && state.maxParticipants <= 512;
  const startOk = state.startDate.length > 0;
  const endOk = state.endDate.length > 0;
  const deadlineOk = state.registrationDeadline.length > 0;

  if (!nameOk || !venueOk || !cityOk || !participantsOk || !startOk || !endOk || !deadlineOk) {
    return false;
  }

  const start = new Date(state.startDate).getTime();
  const end = new Date(state.endDate).getTime();
  const deadline = new Date(state.registrationDeadline).getTime();

  return deadline <= start && start <= end;
}

export function isStep2Valid(state: TournamentForm): boolean {
  return state.categories.length > 0;
}

export function isStep3Valid(state: TournamentForm): boolean {
  return (
    state.pointsToWin >= 1 &&
    state.pointsToWin <= 99 &&
    state.maxTimeouts >= 0 &&
    state.maxTimeouts <= 5 &&
    state.timeoutDuration >= 30 &&
    state.timeoutDuration <= 300
  );
}

export function isStep4Valid(state: TournamentForm): boolean {
  return isStep1Valid(state) && isStep2Valid(state) && isStep3Valid(state);
}

export function isStepValid(step: TournamentForm["step"], state: TournamentForm): boolean {
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
