"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMatchInviteSummary, type MatchInviteSummary } from "@/lib/db/matchPlayerInvites";
import { useAuthStore } from "@/store/authStore";

interface MatchWaitingPanelProps {
  matchId: string;
  teamAName: string;
  teamBName: string;
  onMatchStarted?: () => void;
}

export function MatchWaitingPanel({
  matchId,
  teamAName,
  teamBName,
  onMatchStarted,
}: MatchWaitingPanelProps) {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const [summary, setSummary] = useState<MatchInviteSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await fetchMatchInviteSummary(matchId);
      if (cancelled) return;
      setSummary(result.data);
      setLoading(false);
      if (result.data?.allAccepted) {
        onMatchStarted?.();
      }
    }

    void load();
    const interval = window.setInterval(() => void load(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [matchId, onMatchStarted]);

  if (loading) {
    return (
      <div className="mx-4 my-6 rounded-2xl border border-border bg-arena-surface p-6 text-center text-sm text-muted-foreground">
        Checking invites…
      </div>
    );
  }

  const pending = summary?.players.filter((p) => p.inviteStatus === "pending") ?? [];
  const accepted = summary?.players.filter((p) => p.inviteStatus === "accepted") ?? [];
  const userPending = pending.some(
    (p) => !p.isGuest && p.playerId === userId
  );

  return (
    <div className="mx-4 my-4 flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          Waiting to start
        </p>
        <h2 className="mt-1 text-lg font-bold text-foreground">
          {teamAName}
          <span className="mx-2 font-normal text-muted-foreground">vs</span>
          {teamBName}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Both players must accept before scoring begins. Only then will the match
          count toward ratings.
        </p>
      </div>

      {userPending && (
        <Link
          href={`/match-invite/${matchId}`}
          className="btn-primary text-center text-sm"
        >
          Accept your match invite
        </Link>
      )}

      {pending.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pending ({pending.length})
          </p>
          <ul className="space-y-2">
            {pending.map((player) => (
              <li
                key={player.playerId ?? player.guestId ?? player.fullName}
                className="flex items-center justify-between rounded-xl border border-border bg-arena-surface px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">
                  {player.fullName}
                  {!player.isGuest && player.playerId === userId ? " (you)" : ""}
                  {player.isGuest ? " (guest)" : ""}
                </span>
                <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-semibold text-warning">
                  Pending
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {accepted.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Accepted ({accepted.length})
          </p>
          <ul className="space-y-2">
            {accepted.map((player) => (
              <li
                key={player.playerId ?? player.guestId ?? player.fullName}
                className="flex items-center justify-between rounded-xl border border-border bg-arena-surface px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">
                  {player.fullName}
                  {!player.isGuest && player.playerId === userId ? " (you)" : ""}
                  {player.isGuest ? " (guest)" : ""}
                </span>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                  Accepted
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pending.length === 0 && accepted.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          All players accepted — starting match…
        </p>
      )}
    </div>
  );
}
