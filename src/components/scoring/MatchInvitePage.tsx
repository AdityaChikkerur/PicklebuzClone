"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import {
  fetchPendingMatchInvite,
  notifyMatchParticipants,
  respondToMatchInvite,
} from "@/lib/db/matchPlayerInvites";
import { getMatchById, mapFullMatchToDetail } from "@/lib/db/matches";
import { useAuthStore } from "@/store/authStore";
import type { MatchDetail } from "@/types/match";

interface MatchInvitePageProps {
  matchId: string;
}

export function MatchInvitePage({ matchId }: MatchInvitePageProps) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const profileName = useAuthStore((s) => s.profile?.fullName);
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [hasPendingInvite, setHasPendingInvite] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [matchResult, inviteResult] = await Promise.all([
        getMatchById(matchId),
        userId
          ? fetchPendingMatchInvite(matchId, userId)
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (cancelled) return;
      setMatch(
        matchResult.data
          ? mapFullMatchToDetail(matchResult.data, userId ?? undefined)
          : null
      );
      setHasPendingInvite(Boolean(inviteResult.data));
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [matchId, userId]);

  const isCreator = Boolean(userId && match?.createdBy === userId);

  const handleRespond = async (accept: boolean) => {
    if (!userId) {
      toast.error("Sign in to respond to this invite");
      router.push(`/auth?redirect=/match-invite/${matchId}`);
      return;
    }

    setResponding(true);
    const result = await respondToMatchInvite({ matchId, accept });
    setResponding(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (accept) {
      const matchLabel = match
        ? `${match.teamAName} vs ${match.teamBName}`
        : "the match";

      if (result.data?.matchStarted) {
        toast.success("Everyone accepted — match is live!");
        await notifyMatchParticipants(
          matchId,
          `${matchLabel} is live. Let's play!`,
          userId
        );
        router.push(`/live-scoring/${matchId}`);
      } else {
        toast.success(
          isCreator
            ? "You confirmed! Waiting for your opponent to accept."
            : "You accepted! Waiting for the other player to confirm."
        );
        const waitText = isCreator
          ? `${profileName ?? "Your opponent"} confirmed ${matchLabel}. Accept to start playing.`
          : `${profileName ?? "Your opponent"} accepted ${matchLabel}`;
        await notifyMatchParticipants(matchId, waitText, userId);
        router.push(`/live-scoring/${matchId}`);
      }
    } else {
      toast.info("Invite declined");
      router.push("/notifications");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-muted-foreground">
          Loading invite…
        </div>
      </AppLayout>
    );
  }

  if (!match) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-foreground">Match not found</h1>
          <Link href="/live-scoring" className="btn-primary mt-4 inline-block text-sm">
            Browse matches
          </Link>
        </div>
      </AppLayout>
    );
  }

  const statusLabel =
    match.status === "draft" ? "INVITE" : match.status === "live" ? "LIVE" : match.status.toUpperCase();

  return (
    <AppLayout title="Match invite">
      <div className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
        <div className="card-base p-6 text-center">
          <Badge variant={match.status === "live" ? "live" : "default"} dot className="mb-3">
            {statusLabel}
          </Badge>
          <h1 className="text-xl font-bold text-foreground">
            {isCreator ? "Confirm your match?" : "Join this match?"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isCreator
              ? "Both players must accept before scoring starts. Confirm that you're playing this match."
              : "Accept to confirm you're playing. The match starts only after both players accept."}
          </p>

          <p className="mt-6 text-lg font-bold text-foreground">
            {match.teamAName}
            <span className="mx-2 font-normal text-muted-foreground">vs</span>
            {match.teamBName}
          </p>

          {(match.venue || match.city) && (
            <p className="mt-2 text-xs text-muted-foreground">
              {[match.venue, match.city].filter(Boolean).join(", ")}
            </p>
          )}

          {hasPendingInvite ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                disabled={responding}
                onClick={() => void handleRespond(true)}
                className="btn-primary"
              >
                {responding
                  ? "Accepting…"
                  : isCreator
                    ? "Confirm match"
                    : "Accept & play"}
              </button>
              <button
                type="button"
                disabled={responding}
                onClick={() => void handleRespond(false)}
                className="btn-outline"
              >
                Decline
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <p className="text-sm text-muted-foreground">
                {match.status === "live"
                  ? "Everyone accepted — match is live."
                  : "You already accepted. Waiting for the other player."}
              </p>
              <Link
                href={`/live-scoring/${matchId}`}
                className="btn-primary mt-4 inline-block text-sm"
              >
                {match.status === "live" ? "Start scoring" : "View match status"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
