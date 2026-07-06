import { create } from "zustand";
import { toast } from "sonner";
import { logMatchEvent } from "@/lib/db/matches";
import { generateId, gamesToWin } from "@/lib/utils";
import type {
  FaultType,
  GameScore,
  MatchEvent,
  MatchState,
  Team,
} from "@/types/match";
import { DEFAULT_FAULTS } from "@/types/match";

const MAX_HISTORY = 20;

export const createInitialMatchState = (
  overrides?: Partial<MatchState>
): MatchState => ({
  matchId: generateId(),
  teamAName: "Team A",
  teamBName: "Team B",
  matchType: "doubles",
  scoringType: "rally",
  targetPoints: 11,
  bestOf: 3,
  winBy: 2,
  maxTimeouts: 2,
  timeoutDuration: 60,
  scoreA: 0,
  scoreB: 0,
  currentGame: 1,
  gameScores: [],
  servingTeam: "A",
  serverNumber: 1,
  timeoutsA: 2,
  timeoutsB: 2,
  activeTimeout: null,
  timeoutEndsAt: null,
  faultsA: { ...DEFAULT_FAULTS },
  faultsB: { ...DEFAULT_FAULTS },
  events: [],
  isMatchComplete: false,
  matchWinner: null,
  isFirstServeOfGame: true,
  ...overrides,
});

function opponent(team: Team): Team {
  return team === "A" ? "B" : "A";
}

function getScore(state: MatchState, team: Team): number {
  return team === "A" ? state.scoreA : state.scoreB;
}

function setScore(state: MatchState, team: Team, score: number): MatchState {
  return team === "A" ? { ...state, scoreA: score } : { ...state, scoreB: score };
}

function countGameWins(gameScores: GameScore[], team: Team): number {
  return gameScores.filter((g) => g.winner === team).length;
}

function isGameWon(
  scoreA: number,
  scoreB: number,
  targetPoints: number,
  winBy: number
): Team | null {
  if (scoreA >= targetPoints && scoreA - scoreB >= winBy) return "A";
  if (scoreB >= targetPoints && scoreB - scoreA >= winBy) return "B";
  return null;
}

function createEvent(
  state: MatchState,
  eventType: MatchEvent["eventType"],
  team: Team | null,
  description: string
): MatchEvent {
  return {
    id: generateId(),
    matchId: state.matchId,
    eventType,
    team,
    description,
    scoreA: state.scoreA,
    scoreB: state.scoreB,
    gameNumber: state.currentGame,
    createdAt: new Date().toISOString(),
  };
}

function pushHistory(history: MatchState[], state: MatchState): MatchState[] {
  const snapshot = structuredClone(state);
  const next = [...history, snapshot];
  return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
}

function applyServeChange(state: MatchState, newServingTeam: Team): MatchState {
  const isDoubles = state.matchType === "doubles" || state.matchType === "mixed";

  if (!isDoubles) {
    return { ...state, servingTeam: newServingTeam, serverNumber: 1 };
  }

  if (state.isFirstServeOfGame) {
    return {
      ...state,
      servingTeam: newServingTeam,
      serverNumber: 1,
      isFirstServeOfGame: false,
    };
  }

  if (newServingTeam !== state.servingTeam) {
    return { ...state, servingTeam: newServingTeam, serverNumber: 1 };
  }

  const nextServer: 1 | 2 = state.serverNumber === 1 ? 2 : 1;
  return { ...state, serverNumber: nextServer };
}

function awardPoint(state: MatchState, team: Team, description: string): MatchState {
  const newScore = getScore(state, team) + 1;
  let next = setScore(state, team, newScore);
  next = {
    ...next,
    events: [createEvent(next, "point", team, description), ...next.events],
  };

  if (state.scoringType === "rally") {
    next = applyServeChange(next, team);
  } else if (team !== state.servingTeam) {
    next = applyServeChange(next, team);
  }

  const gameWinner = isGameWon(
    next.scoreA,
    next.scoreB,
    next.targetPoints,
    next.winBy
  );

  if (gameWinner) {
    const gameScore: GameScore = {
      gameNumber: next.currentGame,
      scoreA: next.scoreA,
      scoreB: next.scoreB,
      winner: gameWinner,
    };
    const gameScores = [...next.gameScores, gameScore];
    const gamesNeeded = gamesToWin(next.bestOf);
    const aWins = countGameWins(gameScores, "A");
    const bWins = countGameWins(gameScores, "B");

    next = {
      ...next,
      gameScores,
      events: [
        createEvent(
          { ...next, scoreA: next.scoreA, scoreB: next.scoreB },
          "game_win",
          gameWinner,
          `Game ${next.currentGame} won by Team ${gameWinner}`
        ),
        ...next.events,
      ],
    };

    if (aWins >= gamesNeeded || bWins >= gamesNeeded) {
      const matchWinner: Team = aWins >= gamesNeeded ? "A" : "B";
      return {
        ...next,
        isMatchComplete: true,
        matchWinner,
        events: [
          createEvent(
            next,
            "match_win",
            matchWinner,
            `Match won by Team ${matchWinner}`
          ),
          ...next.events,
        ],
      };
    }

    return {
      ...next,
      scoreA: 0,
      scoreB: 0,
      currentGame: next.currentGame + 1,
      servingTeam: gameWinner === "A" ? "B" : "A",
      serverNumber: 1,
      isFirstServeOfGame: true,
    };
  }

  return next;
}

type PersistableEventType = "point" | "fault" | "side_out" | "timeout";

/** Fire-and-forget DB log; scoring stays instant and in-memory. */
function persistEvent(args: {
  matchId: string | null;
  eventType: PersistableEventType;
  team: Team | null;
  scoreA: number;
  scoreB: number;
  gameNumber: number;
  faultType?: FaultType;
}) {
  if (!args.matchId) return;

  void logMatchEvent({
    matchId: args.matchId,
    eventType: args.eventType,
    team: args.team,
    scoreA: args.scoreA,
    scoreB: args.scoreB,
    gameNumber: args.gameNumber,
    faultType: args.faultType,
  }).then((res) => {
    if (res.error) {
      console.error("match_events insert failed:", res.error);
      toast.error("Live sync paused — scores saved locally");
    }
  });
}

interface MatchStore {
  matchState: MatchState;
  history: MatchState[];
  currentMatchId: string | null;
  addPoint: (team: Team) => void;
  addFault: (team: Team, faultType: FaultType) => void;
  callSideOut: () => void;
  callTimeout: (team: Team) => void;
  clearTimeout: () => void;
  undoLastAction: () => void;
  resetMatch: (overrides?: Partial<MatchState>) => void;
  setMatchFromDB: (
    data: Partial<MatchState> & { incomingEvent?: MatchEvent }
  ) => void;
  setCurrentMatchId: (id: string | null) => void;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  matchState: createInitialMatchState(),
  history: [],
  currentMatchId: null,

  setCurrentMatchId: (id) => set({ currentMatchId: id }),

  addPoint: (team) => {
    const { matchState, history } = get();
    if (matchState.isMatchComplete) return;

    if (matchState.scoringType === "side-out" && team !== matchState.servingTeam) {
      get().callSideOut();
      return;
    }

    const scoreA = team === "A" ? matchState.scoreA + 1 : matchState.scoreA;
    const scoreB = team === "B" ? matchState.scoreB + 1 : matchState.scoreB;
    const gameNumber = matchState.currentGame;

    const next = awardPoint(matchState, team, `Point for Team ${team}`);
    set({ matchState: next, history: pushHistory(history, matchState) });

    const s = get();
    persistEvent({
      matchId: s.currentMatchId,
      eventType: "point",
      team,
      scoreA,
      scoreB,
      gameNumber,
    });
  },

  addFault: (team, faultType) => {
    const { matchState, history } = get();
    if (matchState.isMatchComplete) return;

    const faultKey = team === "A" ? "faultsA" : "faultsB";
    const faults = {
      ...matchState[faultKey],
      [faultType]: matchState[faultKey][faultType] + 1,
    };

    const faultLabels: Record<FaultType, string> = {
      kitchen: "Kitchen violation",
      service: "Service fault",
      double_bounce: "Double bounce",
      out_of_bounds: "Out of bounds",
    };

    let next: MatchState = {
      ...matchState,
      [faultKey]: faults,
      events: [
        createEvent(
          matchState,
          "fault",
          team,
          `${faultLabels[faultType]} — Team ${team}`
        ),
        ...matchState.events,
      ],
    };

    const opposing = opponent(team);
    const scoreA =
      opposing === "A" ? matchState.scoreA + 1 : matchState.scoreA;
    const scoreB =
      opposing === "B" ? matchState.scoreB + 1 : matchState.scoreB;
    const gameNumber = matchState.currentGame;

    next = awardPoint(
      next,
      opposing,
      `Point to Team ${opposing} (${faultLabels[faultType]})`
    );

    set({ matchState: next, history: pushHistory(history, matchState) });

    const s = get();
    persistEvent({
      matchId: s.currentMatchId,
      eventType: "fault",
      team,
      scoreA,
      scoreB,
      gameNumber,
      faultType,
    });
  },

  callSideOut: () => {
    const { matchState, history } = get();
    if (matchState.isMatchComplete) return;

    const newServing = opponent(matchState.servingTeam);
    let next = applyServeChange(
      { ...matchState, servingTeam: newServing },
      newServing
    );

    next = {
      ...next,
      events: [
        createEvent(next, "side_out", newServing, `Side-out — Team ${newServing} serves`),
        ...next.events,
      ],
    };

    set({ matchState: next, history: pushHistory(history, matchState) });

    const s = get();
    persistEvent({
      matchId: s.currentMatchId,
      eventType: "side_out",
      team: newServing,
      scoreA: s.matchState.scoreA,
      scoreB: s.matchState.scoreB,
      gameNumber: s.matchState.currentGame,
    });
  },

  callTimeout: (team) => {
    const { matchState, history } = get();
    if (matchState.isMatchComplete || matchState.activeTimeout) return;

    const remaining = team === "A" ? matchState.timeoutsA : matchState.timeoutsB;
    if (remaining <= 0) return;

    const next: MatchState = {
      ...matchState,
      timeoutsA: team === "A" ? matchState.timeoutsA - 1 : matchState.timeoutsA,
      timeoutsB: team === "B" ? matchState.timeoutsB - 1 : matchState.timeoutsB,
      activeTimeout: team,
      timeoutEndsAt: Date.now() + matchState.timeoutDuration * 1000,
      events: [
        createEvent(matchState, "timeout", team, `Timeout — Team ${team}`),
        ...matchState.events,
      ],
    };

    set({ matchState: next, history: pushHistory(history, matchState) });

    const s = get();
    persistEvent({
      matchId: s.currentMatchId,
      eventType: "timeout",
      team,
      scoreA: s.matchState.scoreA,
      scoreB: s.matchState.scoreB,
      gameNumber: s.matchState.currentGame,
    });
  },

  clearTimeout: () => {
    set((s) => ({
      matchState: {
        ...s.matchState,
        activeTimeout: null,
        timeoutEndsAt: null,
      },
    }));
  },

  undoLastAction: () => {
    const { history } = get();
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    set({
      matchState: structuredClone(previous),
      history: history.slice(0, -1),
    });
  },

  resetMatch: (overrides) => {
    set({
      matchState: createInitialMatchState(overrides),
      history: [],
      currentMatchId: overrides?.matchId ?? null,
    });
  },

  setMatchFromDB: (data) => {
    set((s) => {
      const { incomingEvent, ...rest } = data;
      // Realtime echoes include score/game fields that must not clobber local
      // state until we know the event is not a local echo of our own persist.
      const {
        scoreA: _scoreA,
        scoreB: _scoreB,
        currentGame: _currentGame,
        gameScores: _gameScores,
        ...metaRest
      } = rest;
      let matchState = incomingEvent
        ? { ...s.matchState, ...metaRest }
        : { ...s.matchState, ...rest };

      if (
        incomingEvent &&
        !s.matchState.events.some((e) => e.id === incomingEvent.id)
      ) {
        const localEcho = s.matchState.events.find(
          (e) =>
            e.id !== incomingEvent.id &&
            e.eventType === incomingEvent.eventType &&
            e.scoreA === incomingEvent.scoreA &&
            e.scoreB === incomingEvent.scoreB &&
            e.gameNumber === incomingEvent.gameNumber &&
            e.team === incomingEvent.team
        );

        if (localEcho) {
          matchState.events = [
            incomingEvent,
            ...s.matchState.events.filter((e) => e.id !== localEcho.id),
          ];
          return { matchState };
        }

        const gameWinner = isGameWon(
          incomingEvent.scoreA,
          incomingEvent.scoreB,
          matchState.targetPoints,
          matchState.winBy
        );

        if (
          gameWinner &&
          (incomingEvent.eventType === "point" ||
            incomingEvent.eventType === "fault")
        ) {
          const alreadyRecorded = matchState.gameScores.some(
            (g) => g.gameNumber === incomingEvent.gameNumber
          );
          if (!alreadyRecorded) {
            matchState = {
              ...matchState,
              gameScores: [
                ...matchState.gameScores,
                {
                  gameNumber: incomingEvent.gameNumber,
                  scoreA: incomingEvent.scoreA,
                  scoreB: incomingEvent.scoreB,
                  winner: gameWinner,
                },
              ],
            };
          }

          const gamesNeeded = gamesToWin(matchState.bestOf);
          const aWins = countGameWins(matchState.gameScores, "A");
          const bWins = countGameWins(matchState.gameScores, "B");

          if (aWins >= gamesNeeded || bWins >= gamesNeeded) {
            matchState = {
              ...matchState,
              scoreA: incomingEvent.scoreA,
              scoreB: incomingEvent.scoreB,
              currentGame: incomingEvent.gameNumber,
              isMatchComplete: true,
              matchWinner: aWins >= gamesNeeded ? "A" : "B",
            };
          } else {
            matchState = {
              ...matchState,
              scoreA: 0,
              scoreB: 0,
              currentGame: incomingEvent.gameNumber + 1,
            };
          }
        } else {
          matchState = {
            ...matchState,
            scoreA: incomingEvent.scoreA,
            scoreB: incomingEvent.scoreB,
            currentGame: incomingEvent.gameNumber,
          };
        }

        if (incomingEvent.eventType === "side_out" && incomingEvent.team) {
          matchState = applyServeChange(
            { ...matchState, servingTeam: incomingEvent.team },
            incomingEvent.team
          );
        } else if (incomingEvent.team) {
          const scoringTeam =
            incomingEvent.eventType === "fault"
              ? opponent(incomingEvent.team)
              : incomingEvent.team;
          if (matchState.scoringType === "rally") {
            matchState = applyServeChange(matchState, scoringTeam);
          } else if (scoringTeam !== matchState.servingTeam) {
            matchState = applyServeChange(matchState, scoringTeam);
          }
        }

        matchState.events = [incomingEvent, ...s.matchState.events];
      }

      return { matchState };
    });
  },
}));
