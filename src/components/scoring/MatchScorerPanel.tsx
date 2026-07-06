"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { UserPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { fetchDiscoveryPlayers } from "@/lib/db/players";
import {
  inviteMatchScorer,
  revokeMatchScorer,
  type MatchScorer,
} from "@/lib/db/matchScorers";
import { useMatchScorers } from "@/hooks/useMatchScorers";
import { useAuthStore } from "@/store/authStore";
import type { Player } from "@/types/player";

interface MatchScorerPanelProps {
  matchId: string;
  teamAName: string;
  teamBName: string;
  canManage: boolean;
}

function statusLabel(status: MatchScorer["status"]): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Active";
    case "declined":
      return "Declined";
    default:
      return status;
  }
}

export function MatchScorerPanel({
  matchId,
  teamAName,
  teamBName,
  canManage,
}: MatchScorerPanelProps) {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const { scorers, loading, reload } = useMatchScorers(matchId);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Player[]>([]);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const matchLabel = `${teamAName} vs ${teamBName}`;
  const activeScorers = useMemo(
    () => scorers.filter((s) => s.status !== "declined"),
    [scorers]
  );

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const players = await fetchDiscoveryPlayers({
      search: search.trim(),
      excludeUserId: userId,
    });
    const existingIds = new Set(scorers.map((s) => s.userId));
    setResults(players.filter((p) => !existingIds.has(p.id)).slice(0, 8));
    setSearching(false);
  };

  const handleInvite = async (player: Player) => {
    if (!userId) {
      toast.error("Sign in to invite scorers");
      return;
    }
    setInvitingId(player.id);
    const result = await inviteMatchScorer({
      matchId,
      userId: player.id,
      invitedBy: userId,
      role: "admin",
      matchLabel,
    });
    setInvitingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Invite sent to ${player.fullName}`);
    setSearch("");
    setResults([]);
    reload();
  };

  const handleRevoke = async (scorer: MatchScorer) => {
    const result = await revokeMatchScorer(matchId, scorer.userId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Removed ${scorer.fullName}`);
    reload();
  };

  if (!canManage && activeScorers.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-arena-border px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Match admins ({activeScorers.length})
        </span>
        <span className="text-xs font-semibold text-primary">
          {open ? "Hide" : "Manage"}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : activeScorers.length > 0 ? (
            <ul className="space-y-2">
              {activeScorers.map((scorer) => (
                <li
                  key={scorer.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-arena-surface px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {scorer.fullName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {scorer.role === "admin" ? "Can score & invite" : "Scorer"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={scorer.status === "accepted" ? "success" : "warning"}
                      className="text-[10px]"
                    >
                      {statusLabel(scorer.status)}
                    </Badge>
                    {canManage && scorer.userId !== userId && (
                      <button
                        type="button"
                        onClick={() => void handleRevoke(scorer)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Remove ${scorer.fullName}`}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              No delegated admins yet. Invite someone to help score this match.
            </p>
          )}

          {canManage && (
            <div className="rounded-xl border border-dashed border-border p-3">
              <p className="mb-2 text-xs font-semibold text-foreground">
                Invite a scorer
              </p>
              <p className="mb-2 text-[11px] text-muted-foreground">
                They must accept the invite before they can update scores live.
              </p>
              <div className="flex gap-2">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSearch();
                  }}
                  placeholder="Search player name…"
                  className="input-base flex-1 text-sm"
                />
                <button
                  type="button"
                  disabled={searching || !search.trim()}
                  onClick={() => void handleSearch()}
                  className="btn-outline shrink-0 text-xs"
                >
                  {searching ? "…" : "Find"}
                </button>
              </div>

              {results.length > 0 && (
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                  {results.map((player) => (
                    <li key={player.id}>
                      <button
                        type="button"
                        disabled={invitingId === player.id}
                        onClick={() => void handleInvite(player)}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        <span>
                          {player.fullName}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {player.city}
                          </span>
                        </span>
                        <UserPlusIcon className="h-4 w-4 text-primary" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
