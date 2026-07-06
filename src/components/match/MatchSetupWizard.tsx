"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createMatch } from "@/lib/db/matches";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { createInitialMatchState, useMatchStore } from "@/store/matchStore";
import { useAuthStore } from "@/store/authStore";
import { INITIAL_MATCH_SETUP, type MatchSetupState } from "@/types/match";
import { MatchTypeStep } from "./MatchTypeStep";
import { PlayersStep } from "./PlayersStep";
import { ScoringConfigStep } from "./ScoringConfigStep";
import { StepIndicator } from "./StepIndicator";
import { VenueStep } from "./VenueStep";
import { isStepValid } from "./validation";

export function MatchSetupWizard() {
  const router = useRouter();
  const resetMatch = useMatchStore((s) => s.resetMatch);
  const setCurrentMatchId = useMatchStore((s) => s.setCurrentMatchId);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const [setup, setSetup] = useState<MatchSetupState>(INITIAL_MATCH_SETUP);
  const [starting, setStarting] = useState(false);

  const updateSetup = useCallback((partial: Partial<MatchSetupState>) => {
    setSetup((prev) => {
      const next = { ...prev, ...partial };
      if (partial.matchType && partial.matchType !== prev.matchType) {
        next.players = [];
      }
      return next;
    });
  }, []);

  const goBack = () => {
    if (setup.step > 1) {
      setSetup((prev) => ({
        ...prev,
        step: (prev.step - 1) as MatchSetupState["step"],
      }));
    }
  };

  const goNext = async () => {
    if (!isStepValid(setup.step, setup)) return;

    if (setup.step < 4) {
      setSetup((prev) => ({
        ...prev,
        step: (prev.step + 1) as MatchSetupState["step"],
      }));
      return;
    }

    setStarting(true);

    if (isSupabaseConfigured() && !useAuthStore.getState().profile?.profileComplete) {
      setStarting(false);
      toast.error("Complete your profile before creating a match.");
      return;
    }

    if (isSupabaseConfigured() && !userId) {
      setStarting(false);
      toast.error("Sign in to create a match.");
      return;
    }

    const teamAPlayerIds = setup.players
      .filter((p) => p.team === "A" && !p.isGuest)
      .map((p) => p.playerId);
    const teamBPlayerIds = setup.players
      .filter((p) => p.team === "B" && !p.isGuest)
      .map((p) => p.playerId);

    const created = await createMatch({
      createdBy: userId ?? "00000000-0000-0000-0000-000000000000",
      setup,
      teamAPlayerIds,
      teamBPlayerIds,
      matchPlayers: setup.players,
    });

    setStarting(false);

    if (created.error) {
      toast.error(`Couldn't create match: ${created.error}`);
    }

    const persistedId = created.data?.id ?? null;

    const matchState = createInitialMatchState({
      matchId: persistedId ?? undefined,
      teamAName: setup.teamAName.trim(),
      teamBName: setup.teamBName.trim(),
      matchType: setup.matchType,
      scoringType: setup.scoringType,
      targetPoints: setup.targetPoints,
      bestOf: setup.bestOf,
      winBy: setup.winBy,
      maxTimeouts: setup.maxTimeouts,
      timeoutDuration: setup.timeoutDuration,
      timeoutsA: setup.maxTimeouts,
      timeoutsB: setup.maxTimeouts,
    });

    resetMatch(matchState);
    setCurrentMatchId(persistedId);
    toast.success("Match ready. Let's score!");
    router.push(persistedId ? `/live-scoring/${persistedId}` : "/live-scoring/local");
  };

  const canContinue = isStepValid(setup.step, setup);
  const isLastStep = setup.step === 4;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <StepIndicator currentStep={setup.step} onBack={setup.step > 1 ? goBack : undefined} />

      <div className="card-base p-5 sm:p-6">
        {setup.step === 1 && (
          <MatchTypeStep
            matchType={setup.matchType}
            matchCategory={setup.matchCategory}
            isPublic={setup.isPublic}
            onChange={updateSetup}
          />
        )}
        {setup.step === 2 && (
          <PlayersStep setup={setup} onChange={updateSetup} />
        )}
        {setup.step === 3 && (
          <VenueStep setup={setup} onChange={updateSetup} />
        )}
        {setup.step === 4 && (
          <ScoringConfigStep setup={setup} onChange={updateSetup} />
        )}
      </div>

      <button
        type="button"
        onClick={() => void goNext()}
        disabled={!canContinue || starting}
        className="btn-primary w-full"
      >
        {starting ? "Starting…" : isLastStep ? "Start Live Scoring" : "Continue"}
      </button>
    </div>
  );
}
