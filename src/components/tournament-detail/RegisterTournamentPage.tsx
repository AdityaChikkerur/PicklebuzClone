"use client";



import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { toast } from "sonner";

import { AppLayout } from "@/components/layout";

import { Avatar } from "@/components/ui/Avatar";

import { Badge } from "@/components/ui/Badge";

import { PaymentPanel } from "@/components/monetization";

import { MOCK_SEARCH_PLAYERS } from "@/components/match/mockData";

import { useTournamentDetail } from "@/hooks/useTournamentDetail";

import { registerForTournament } from "@/lib/db/tournaments";

import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";

import { isUuid } from "@/lib/db/config";

import { fetchDiscoveryPlayers } from "@/lib/db/players";

import { cn, formatCurrency } from "@/lib/utils";

import {

  CATEGORY_TYPE_LABELS,

  type CategoryType,

  type RegistrationStatus,

  type TournamentCategory,

} from "@/types/tournament";

import { useAuthStore } from "@/store/authStore";

import { usePayments } from "@/hooks/usePayments";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { isRazorpayEnabled } from "@/lib/payments/isRazorpayEnabled";

import type { Player } from "@/types/player";



interface RegisterTournamentPageProps {

  tournamentId: string;

}



type Step = "category" | "partner" | "summary" | "status";



export function RegisterTournamentPage({ tournamentId }: RegisterTournamentPageProps) {

  const router = useRouter();

  const profile = useAuthStore((s) => s.profile);

  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);

  const { recordPayment } = usePayments(userId);
  const { paying, startCheckout } = useRazorpayCheckout();
  const razorpayLive = isRazorpayEnabled();

  const { tournament, loading, reload } = useTournamentDetail(tournamentId);



  const [step, setStep] = useState<Step>("category");

  const [selectedCategory, setSelectedCategory] = useState<TournamentCategory | null>(null);

  const [partner, setPartner] = useState<Player | null>(null);

  const [partnerQuery, setPartnerQuery] = useState("");

  const [partnerOptions, setPartnerOptions] = useState<Player[]>([]);

  const [partnersLoading, setPartnersLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>("pending");



  useEffect(() => {
    if (!tournament) return;

    if (tournament.userRegistration) {
      setRegistrationStatus(tournament.userRegistration.status);
      const cat = tournament.categories.find(
        (c) => c.id === tournament.userRegistration?.categoryId
      );
      if (cat) setSelectedCategory(cat);
      setStep("status");
      return;
    }

    if (tournament.categories[0]) {
      setSelectedCategory((prev) => prev ?? tournament.categories[0]);
    }
  }, [tournament]);



  useEffect(() => {

    if (step !== "partner") return;



    let cancelled = false;



    async function loadPartners() {

      setPartnersLoading(true);

      try {

        if (isSupabaseConfigured()) {

          const rows = await fetchDiscoveryPlayers({

            search: partnerQuery,

            excludeUserId: userId,

          });

          if (!cancelled) setPartnerOptions(rows);

        } else {

          const q = partnerQuery.trim().toLowerCase();

          const filtered = MOCK_SEARCH_PLAYERS.filter((p) => {

            if (p.id === "current-user") return false;

            if (!q) return true;

            return (

              p.fullName.toLowerCase().includes(q) ||

              p.city.toLowerCase().includes(q)

            );

          });

          if (!cancelled) setPartnerOptions(filtered);

        }

      } finally {

        if (!cancelled) setPartnersLoading(false);

      }

    }



    void loadPartners();

    return () => {

      cancelled = true;

    };

  }, [step, partnerQuery, userId]);



  const filteredPartners = useMemo(() => partnerOptions, [partnerOptions]);



  if (loading) {

    return (

      <AppLayout>

        <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted-foreground">

          Loading tournament…

        </div>

      </AppLayout>

    );

  }



  if (!tournament) {

    return (

      <AppLayout>

        <div className="mx-auto max-w-lg px-4 py-16 text-center">

          <h1 className="text-xl font-bold text-foreground">Tournament not found</h1>

          <Link href="/dashboard" className="btn-primary mt-6 inline-block">

            Back to Dashboard

          </Link>

        </div>

      </AppLayout>

    );

  }



  const needsPartner = (type: CategoryType) =>

    type === "doubles" || type === "mixed";



  const entryFee = selectedCategory?.entryFee ?? 0;

  const playerName = profile?.fullName ?? "You";



  const handleSubmit = async (options?: { skipPayment?: boolean }) => {

    if (!userId || !selectedCategory) {

      toast.error("Sign in to register");

      return;

    }



    if (needsPartner(selectedCategory.categoryType) && !partner) {

      toast.error("Select a partner to continue");

      return;

    }



    setSubmitting(true);



    try {

      const partnerId =

        partner && isUuid(partner.id) ? partner.id : undefined;



      const result = await registerForTournament({

        tournamentId,

        playerId: userId,

        categoryId: selectedCategory.id,

        partnerId: partnerId ?? null,

      });



      if (result.error) {

        toast.error(result.error);

        return;

      }



      const registrationId = result.data?.id ?? null;



      if (entryFee > 0) {

        if (razorpayLive && !options?.skipPayment) {

          const paid = await startCheckout({

            kind: "tournament_fee",

            refId: registrationId ?? tournamentId,

            amount: entryFee,

            description: `${tournament.name} — entry fee`,

            prefill: {

              name: profile?.fullName,

              email: useAuthStore.getState().user?.email ?? undefined,

            },

          });



          if (!paid) {

            toast.info("Registration saved — complete payment when ready.");

          } else {

            toast.success("Payment received — registration submitted", {

              description: "Organizer will review your entry shortly.",

            });

          }

        } else {

          void recordPayment({

            kind: "tournament_fee",

            refId: registrationId ?? tournamentId,

            amount: entryFee,

            status: "pending",

            successMessage: "Registration submitted (entry fee pending)",

          });

        }

      } else {

        toast.success("Registration submitted", {

          description: "Organizer will review your entry shortly.",

        });

      }



      setRegistrationStatus("pending");

      setStep("status");

      reload();

    } finally {

      setSubmitting(false);

    }

  };



  return (

    <AppLayout title="Register">

      <div className="mx-auto max-w-lg">

        <button

          type="button"

          onClick={() => router.push(`/tournament/${tournamentId}`)}

          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"

        >

          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />

          {tournament.name}

        </button>



        <div className="mb-6">

          <p className="text-sm text-muted-foreground">Tournament registration</p>

          <h2 className="text-xl font-bold text-foreground">{tournament.name}</h2>

        </div>



        {step === "category" && (

          <div className="flex flex-col gap-4">

            <p className="text-sm text-muted-foreground">Select a category</p>

            <ul className="flex flex-col gap-3">

              {tournament.categories.map((cat) => (

                <li key={cat.id}>

                  <button

                    type="button"

                    onClick={() => {

                      setSelectedCategory(cat);

                      setPartner(null);

                    }}

                    className={cn(

                      "card-base w-full p-4 text-left transition-colors",

                      selectedCategory?.id === cat.id &&

                        "border-primary ring-2 ring-primary/20"

                    )}

                  >

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <p className="font-semibold text-foreground">

                          {CATEGORY_TYPE_LABELS[cat.categoryType]}

                        </p>

                        <Badge variant="outline" className="mt-1">

                          {cat.skillLevel}

                        </Badge>

                      </div>

                      <span className="font-bold text-foreground">

                        {formatCurrency(cat.entryFee)}

                      </span>

                    </div>

                  </button>

                </li>

              ))}

            </ul>

            <button

              type="button"

              disabled={!selectedCategory}

              onClick={() =>

                selectedCategory && needsPartner(selectedCategory.categoryType)

                  ? setStep("partner")

                  : setStep("summary")

              }

              className="btn-primary"

            >

              Continue

            </button>

          </div>

        )}



        {step === "partner" && selectedCategory && (

          <div className="flex flex-col gap-4">

            <p className="text-sm text-muted-foreground">

              Select your partner for {CATEGORY_TYPE_LABELS[selectedCategory.categoryType]}

            </p>

            <input

              type="search"

              value={partnerQuery}

              onChange={(e) => setPartnerQuery(e.target.value)}

              placeholder="Search players by name or city"

              className="input-base"

            />

            <ul className="card-base max-h-64 divide-y divide-border overflow-y-auto">

              {partnersLoading ? (

                <li className="px-4 py-6 text-center text-sm text-muted-foreground">

                  Loading players…

                </li>

              ) : filteredPartners.length === 0 ? (

                <li className="px-4 py-6 text-center text-sm text-muted-foreground">

                  No players found

                </li>

              ) : (

                filteredPartners.map((player) => (

                  <li key={player.id}>

                    <button

                      type="button"

                      onClick={() => setPartner(player)}

                      className={cn(

                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",

                        partner?.id === player.id && "bg-primary/5"

                      )}

                    >

                      <Avatar src={player.avatarUrl} name={player.fullName} size="sm" />

                      <div>

                        <p className="text-sm font-semibold text-foreground">

                          {player.fullName}

                        </p>

                        <p className="text-xs text-muted-foreground">

                          {player.city} · {player.skillLevel}

                        </p>

                      </div>

                    </button>

                  </li>

                ))

              )}

            </ul>

            <div className="flex gap-2">

              <button type="button" onClick={() => setStep("category")} className="btn-outline flex-1">

                Back

              </button>

              <button

                type="button"

                disabled={!partner}

                onClick={() => setStep("summary")}

                className="btn-primary flex-1"

              >

                Continue

              </button>

            </div>

          </div>

        )}



        {step === "summary" && selectedCategory && (

          <div className="flex flex-col gap-4">

            <div className="card-base space-y-3 p-4">

              <h3 className="text-sm font-bold text-foreground">Registration summary</h3>

              <dl className="space-y-2 text-sm">

                <div className="flex justify-between">

                  <dt className="text-muted-foreground">Category</dt>

                  <dd className="font-semibold text-foreground">

                    {CATEGORY_TYPE_LABELS[selectedCategory.categoryType]}

                  </dd>

                </div>

                <div className="flex justify-between">

                  <dt className="text-muted-foreground">Player</dt>

                  <dd className="font-semibold text-foreground">{playerName}</dd>

                </div>

                {partner && (

                  <div className="flex justify-between">

                    <dt className="text-muted-foreground">Partner</dt>

                    <dd className="font-semibold text-foreground">{partner.fullName}</dd>

                  </div>

                )}

                <div className="flex justify-between border-t border-border pt-2">

                  <dt className="text-muted-foreground">Entry fee</dt>

                  <dd className="text-lg font-bold text-foreground">

                    {formatCurrency(entryFee)}

                  </dd>

                </div>

              </dl>

            </div>



            <PaymentPanel

              amount={entryFee}

              label="Tournament entry fee"

            />



            <div className="flex gap-2">

              <button

                type="button"

                onClick={() =>

                  setStep(

                    needsPartner(selectedCategory.categoryType) ? "partner" : "category"

                  )

                }

                className="btn-outline flex-1"

              >

                Back

              </button>

              {razorpayLive && entryFee > 0 ? (

                <button

                  type="button"

                  onClick={() => void handleSubmit()}

                  disabled={submitting || paying}

                  className="btn-primary flex-1"

                >

                  {submitting || paying ? "Processing…" : "Pay & submit"}

                </button>

              ) : (

                <button

                  type="button"

                  onClick={() => void handleSubmit({ skipPayment: true })}

                  disabled={submitting}

                  className="btn-primary flex-1"

                >

                  {submitting

                    ? "Submitting…"

                    : entryFee > 0

                      ? "Pay later & submit"

                      : "Submit registration"}

                </button>

              )}

            </div>

          </div>

        )}



        {step === "status" && (

          <div className="card-base p-6 text-center">

            <Badge

              variant={

                registrationStatus === "approved"

                  ? "success"

                  : registrationStatus === "pending"

                    ? "warning"

                    : "danger"

              }

              className="mb-4"

            >

              {registrationStatus}

            </Badge>

            <h3 className="text-lg font-bold text-foreground">

              {registrationStatus === "approved"

                ? "You're in!"

                : registrationStatus === "pending"

                  ? "Awaiting approval"

                  : "Registration declined"}

            </h3>

            <p className="mt-2 text-sm text-muted-foreground">

              {registrationStatus === "approved"

                ? "Your registration has been approved. See you on court!"

                : registrationStatus === "pending"

                  ? "The organizer will review your entry. You'll get a notification when approved."

                  : "Contact the organizer if you believe this was a mistake."}

            </p>

            {selectedCategory && (

              <p className="mt-4 text-xs text-muted-foreground">

                {CATEGORY_TYPE_LABELS[selectedCategory.categoryType]}

                {partner && ` · Partner: ${partner.fullName}`}

                {tournament.userRegistration?.partnerName &&

                  !partner &&

                  ` · Partner: ${tournament.userRegistration.partnerName}`}

              </p>

            )}

            <Link

              href={`/tournament/${tournamentId}`}

              className="btn-primary mt-6 inline-block"

            >

              Back to tournament

            </Link>

          </div>

        )}

      </div>

    </AppLayout>

  );

}

