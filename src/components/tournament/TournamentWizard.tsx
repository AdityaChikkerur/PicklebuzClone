"use client";



import { useCallback, useState } from "react";

import { toast } from "sonner";

import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";

import { createTournament } from "@/lib/db/tournaments";

import { useAuthStore } from "@/store/authStore";

import { INITIAL_TOURNAMENT_FORM, type TournamentForm } from "@/types/tournament";

import { BasicsStep } from "./BasicsStep";

import { CategoriesStep } from "./CategoriesStep";

import { MatchRulesStep } from "./MatchRulesStep";

import { PublishSuccessScreen } from "./PublishSuccessScreen";

import { ReviewStep } from "./ReviewStep";

import { StepIndicator } from "./StepIndicator";

import { isStepValid } from "./validation";



export function TournamentWizard() {

  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);

  const [form, setForm] = useState<TournamentForm>(INITIAL_TOURNAMENT_FORM);

  const [published, setPublished] = useState(false);

  const [publishedName, setPublishedName] = useState("");

  const [publishedId, setPublishedId] = useState<string | null>(null);

  const [publishing, setPublishing] = useState(false);



  const updateForm = useCallback((partial: Partial<TournamentForm>) => {

    setForm((prev) => ({ ...prev, ...partial }));

  }, []);



  const goBack = () => {

    if (form.step > 1) {

      setForm((prev) => ({

        ...prev,

        step: (prev.step - 1) as TournamentForm["step"],

      }));

    }

  };



  const publishTournament = async () => {

    if (!isStepValid(4, form)) return;



    if (isSupabaseConfigured() && !userId) {

      toast.error("Sign in to publish a tournament");

      return;

    }



    setPublishing(true);



    try {

      if (isSupabaseConfigured() && userId) {

        const result = await createTournament(form, userId);

        if (result.error || !result.data) {
          toast.error(result.error ?? "Failed to publish tournament");
          return;
        }

        setPublishedId(result.data.id);

      } else {

        await new Promise((resolve) => setTimeout(resolve, 600));

        setPublishedId(null);

      }



      setPublishedName(form.name.trim());

      setPublished(true);

      toast.success("Tournament published successfully!");

    } catch {

      toast.error("Failed to publish tournament. Please try again.");

    } finally {

      setPublishing(false);

    }

  };



  const goNext = () => {

    if (!isStepValid(form.step, form)) return;



    if (form.step < 4) {

      setForm((prev) => ({

        ...prev,

        step: (prev.step + 1) as TournamentForm["step"],

      }));

      return;

    }



    void publishTournament();

  };



  const handleCreateAnother = () => {

    setForm(INITIAL_TOURNAMENT_FORM);

    setPublished(false);

    setPublishedName("");

    setPublishedId(null);

  };



  if (published) {

    return (

      <PublishSuccessScreen

        tournamentName={publishedName}

        tournamentId={publishedId}

        onCreateAnother={handleCreateAnother}

      />

    );

  }



  const canContinue = isStepValid(form.step, form);

  const isLastStep = form.step === 4;



  return (

    <div className="mx-auto flex max-w-2xl flex-col gap-6">

      <StepIndicator currentStep={form.step} onBack={form.step > 1 ? goBack : undefined} />



      <div className="card-base p-5 sm:p-6">

        {form.step === 1 && <BasicsStep form={form} onChange={updateForm} />}

        {form.step === 2 && <CategoriesStep form={form} onChange={updateForm} />}

        {form.step === 3 && <MatchRulesStep form={form} onChange={updateForm} />}

        {form.step === 4 && <ReviewStep form={form} />}

      </div>



      <button

        type="button"

        onClick={goNext}

        disabled={!canContinue || publishing}

        className="btn-primary w-full"

      >

        {publishing

          ? "Publishing…"

          : isLastStep

            ? "Publish Tournament"

            : "Continue"}

      </button>

    </div>

  );

}

