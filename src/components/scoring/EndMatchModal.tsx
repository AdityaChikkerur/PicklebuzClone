"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { endMatch } from "@/lib/db/matches";
import { fetchProfileById } from "@/lib/db/profiles";
import { usePlayerStatsReload } from "@/hooks/usePlayerStats";
import { gamesToWin } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useMatchStore } from "@/store/matchStore";
import type { MatchState } from "@/types/match";

interface EndMatchModalProps {
  open: boolean;
  matchState: MatchState;
  onClose: () => void;
}

function countWins(matchState: MatchState, team: "A" | "B"): number {
  return matchState.gameScores.filter((g) => g.winner === team).length;
}

export function EndMatchModal({
  open,
  matchState,
  onClose,
}: EndMatchModalProps) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const setProfile = useAuthStore((s) => s.setProfile);
  const reloadStats = usePlayerStatsReload();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const winsA = countWins(matchState, "A");
  const winsB = countWins(matchState, "B");
  const gamesNeeded = gamesToWin(matchState.bestOf);

  const handleSave = async () => {
    setSaving(true);

    const store = useMatchStore.getState();
    const matchId =
      store.currentMatchId ?? matchState.matchId ?? null;

    if (!matchId || matchId.startsWith("mock-")) {
      setSaving(false);
      toast.error("This match was not linked to your account. Start a new match from Match Setup.");
      return;
    }

    const result = await endMatch({
      matchId,
      gameScores: matchState.gameScores,
      matchWinner: matchState.matchWinner,
    });

    setSaving(false);

    if (result.error) {
      toast.error(`Save failed: ${result.error}`);
      return;
    }

    if (userId) {
      const refreshed = await fetchProfileById(userId);
      if (refreshed.data) {
        setProfile(refreshed.data);
      }
    }
    reloadStats();

    toast.success(
      result.data?.mock
        ? "Match saved (demo mode)"
        : "Match saved. Stats updated."
    );

    if (result.data?.timingMessage) {
      toast.warning(result.data.timingMessage);
    }

    onClose();
    store.resetMatch();
    router.push(`/match/${matchId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close end match dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-match-title"
        className="relative z-10 w-full max-w-md rounded-t-3xl glass-strong border border-border p-5 shadow-[0_-16px_48px_rgba(0,0,0,0.6)] sm:rounded-2xl scale-in"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="end-match-title"
              className="font-display text-lg font-black italic text-foreground"
            >
              End match
            </h2>
            <p className="text-sm text-muted-foreground">Review the score summary</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-border bg-arena-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold text-primary">
              {matchState.teamAName}
            </span>
            <span className="font-display text-2xl font-black italic tabular-nums text-foreground">
              {winsA} – {winsB}
            </span>
            <span className="font-semibold text-foreground">
              {matchState.teamBName}
            </span>
          </div>

          {matchState.gameScores.length > 0 ? (
            <ul className="space-y-1.5">
              {matchState.gameScores.map((game) => (
                <li
                  key={game.gameNumber}
                  className="flex justify-between text-sm text-muted-foreground"
                >
                  <span>Game {game.gameNumber}</span>
                  <span className="font-medium">
                    {game.scoreA} – {game.scoreB}
                    {game.winner && (
                      <span className="ml-2 text-xs text-muted-foreground/70">
                        (Team {game.winner})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Current game: {matchState.scoreA} – {matchState.scoreB}
            </p>
          )}

          {!matchState.isMatchComplete && (
            <p className="mt-3 text-xs text-warning">
              Match not finished. Needs {gamesNeeded} game wins to complete.
            </p>
          )}

          {matchState.isMatchComplete && matchState.matchWinner && (
            <p className="mt-3 text-sm font-semibold text-primary">
              Winner: Team {matchState.matchWinner} (
              {matchState.matchWinner === "A"
                ? matchState.teamAName
                : matchState.teamBName}
              )
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/60"
          >
            Keep Scoring
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? "Saving…" : "Save & Exit"}
          </button>
        </div>
      </div>
    </div>
  );
}
