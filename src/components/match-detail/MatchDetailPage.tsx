"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { ArrowLeftIcon, ShareIcon } from "@heroicons/react/24/outline";

import { toast } from "sonner";

import { AppLayout } from "@/components/layout";

import { Badge } from "@/components/ui/Badge";

import { useMatchDetail } from "@/hooks/useMatchDetail";

import { getDefaultHomeForRole } from "@/lib/auth/routeGuards";

import { useAuthStore } from "@/store/authStore";

import { AIReportCard } from "./AIReportCard";

import { GameScoreChips } from "./GameScoreChips";

import { MatchStatsTiles } from "./MatchStatsTiles";

import { VerificationPanel } from "./VerificationPanel";

import { APP_URL, copyToClipboard, formatDateTime } from "@/lib/utils";

import type { MatchDetail, MatchStatus } from "@/types/match";



interface MatchDetailPageProps {

  matchId: string;

}



function statusBadgeVariant(

  status: MatchStatus

): "success" | "warning" | "danger" | "default" {

  switch (status) {

    case "verified":

    case "completed":

      return "success";

    case "pending":

      return "warning";

    case "disputed":

      return "danger";

    case "live":

      return "danger";

    default:

      return "default";

  }

}



export function MatchDetailPage({ matchId }: MatchDetailPageProps) {

  const router = useRouter();

  const profile = useAuthStore((s) => s.profile);

  const homeHref = getDefaultHomeForRole(profile?.role);

  const { match: loaded, loading, error, reload } = useMatchDetail(matchId);

  const [match, setMatch] = useState<MatchDetail | null>(null);



  useEffect(() => {

    if (loaded) setMatch(loaded);

  }, [loaded]);



  if (loading) {

    return (

      <AppLayout>

        <div className="mx-auto max-w-lg px-4 py-16 text-center">

          <p className="text-muted-foreground">Loading match…</p>

        </div>

      </AppLayout>

    );

  }



  if (!match) {

    return (

      <AppLayout>

        <div className="mx-auto max-w-lg px-4 py-16 text-center">

          <h1 className="text-xl font-bold text-foreground">Match not found</h1>

          <p className="mt-2 text-sm text-muted-foreground">

            {error ?? (

              <>

                Try{" "}

                <Link href="/match/m1" className="text-primary underline">

                  /match/m1

                </Link>{" "}

                or{" "}

                <Link href="/match/m-pending" className="text-primary underline">

                  /match/m-pending

                </Link>

              </>

            )}

          </p>

          <button

            type="button"

            onClick={() => router.push(homeHref)}

            className="btn-primary mt-6"

          >

            Back to home

          </button>

        </div>

      </AppLayout>

    );

  }



  const winnerName =

    match.winner === "A"

      ? match.teamAName

      : match.winner === "B"

        ? match.teamBName

        : null;



  const handleShare = async () => {

    const url = `${APP_URL}/spectate/${match.id}`;

    const ok = await copyToClipboard(url);

    if (ok) toast.success("Spectator link copied");

    else toast.error("Could not copy link");

  };



  const handleStatusChange = (status: MatchStatus) => {

    setMatch((m) => (m ? { ...m, status } : m));

    reload();

  };



  return (

    <AppLayout>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-24">

        <div className="flex items-center justify-between gap-3">

          <button

            type="button"

            onClick={() => router.back()}

            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"

            aria-label="Go back"

          >

            <ArrowLeftIcon className="h-4 w-4" />

            Back

          </button>

          <button

            type="button"

            onClick={handleShare}

            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted"

            aria-label="Share spectator link"

          >

            <ShareIcon className="h-4 w-4" />

            Share

          </button>

        </div>



        {/* Scoreboard header */}

        <div className="card-base overflow-hidden">

          <div className="bg-[#0f172a] px-5 py-8 text-center text-slate-100">

            <div className="mb-3 flex justify-center gap-2">

              <Badge variant={statusBadgeVariant(match.status)}>

                {match.status.toUpperCase()}

              </Badge>

              <Badge variant="default">{match.matchType}</Badge>

            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-8">

              <div className="flex-1 text-right">

                <p className="text-sm text-slate-400">Team A</p>

                <p className="text-lg font-bold sm:text-xl">{match.teamAName}</p>

              </div>

              <div className="text-3xl font-extrabold tabular-nums sm:text-4xl">vs</div>

              <div className="flex-1 text-left">

                <p className="text-sm text-slate-400">Team B</p>

                <p className="text-lg font-bold sm:text-xl">{match.teamBName}</p>

              </div>

            </div>

            {winnerName && (

              <p className="mt-4 text-sm font-semibold text-primary">

                Winner: {winnerName}

              </p>

            )}

          </div>

          <div className="border-t border-border px-5 py-4">

            <p className="text-sm text-muted-foreground">

              {match.venue} · {match.city}

              {match.completedAt && (

                <> · {formatDateTime(match.completedAt)}</>

              )}

            </p>

          </div>

        </div>



        <VerificationPanel match={match} onStatusChange={handleStatusChange} />



        <section>

          <h2 className="mb-3 text-sm font-semibold text-foreground">Games</h2>

          <GameScoreChips

            gameScores={match.gameScores}

            teamAName={match.teamAName}

            teamBName={match.teamBName}

          />

        </section>



        <section>

          <h2 className="mb-3 text-sm font-semibold text-foreground">Stats</h2>

          <MatchStatsTiles

            stats={match.stats}

            teamAName={match.teamAName}

            teamBName={match.teamBName}

          />

        </section>



        {match.localRules && (

          <div className="card-base p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">

              Local rules

            </p>

            <p className="mt-1 text-sm text-foreground">{match.localRules}</p>

          </div>

        )}



        <AIReportCard match={match} />



        {match.status === "live" && (

          <Link href={`/spectate/${match.id}`} className="btn-primary block text-center">

            Watch live

          </Link>

        )}

      </div>

    </AppLayout>

  );

}


