"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { fetchPendingScorerInvite, respondToScorerInvite } from "@/lib/db/matchScorers";
import { getMatchById, mapFullMatchToDetail } from "@/lib/db/matches";
import { useAuthStore } from "@/store/authStore";
import type { MatchDetail } from "@/types/match";

interface ScorerInvitePageProps {
  matchId: string;
}

export function ScorerInvitePage({ matchId }: ScorerInvitePageProps) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
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
          ? fetchPendingScorerInvite(matchId, userId)
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

  const handleRespond = async (accept: boolean) => {
    if (!userId) {
      toast.error("Sign in to respond to this invite");
      router.push(`/auth?redirect=/scorer-invite/${matchId}`);
      return;
    }

    setResponding(true);
    const result = await respondToScorerInvite({ matchId, userId, accept });
    setResponding(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (accept) {
      toast.success("You're now a match admin — you can score live!");
      router.push(`/live-scoring/${matchId}`);
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
            Browse live matches
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Scorer invite">
      <div className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
        <div className="card-base p-6 text-center">
          <Badge variant="live" dot className="mb-3">
            LIVE MATCH
          </Badge>
          <h1 className="text-xl font-bold text-foreground">Score this match?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve been invited to help score and manage this match live.
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
                {responding ? "Accepting…" : "Accept & score"}
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
                This invite is no longer pending.
              </p>
              <Link
                href={`/live-scoring/${matchId}`}
                className="btn-primary mt-4 inline-block text-sm"
              >
                Open match
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
