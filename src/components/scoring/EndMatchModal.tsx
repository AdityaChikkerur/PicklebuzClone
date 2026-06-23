"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { endMatch } from "@/lib/db/matches";
import { gamesToWin } from "@/lib/utils";
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
    const matchId = store.currentMatchId;

    const result = await endMatch({
      matchId: matchId ?? "mock-noid",
      gameScores: matchState.gameScores,
      matchWinner: matchState.matchWinner,
    });

    setSaving(false);

    if (result.error) {
      toast.error(`Save failed: ${result.error}`);
      return;
    }

    toast.success(
      result.data?.mock
        ? "Match saved (demo mode)"
        : "Match saved — awaiting opponent confirmation"
    );

    onClose();
    store.resetMatch();
    router.push(matchId ? `/match/${matchId}` : "/dashboard");
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
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="end-match-title"
              className="text-lg font-bold text-slate-100"
            >
              End match
            </h2>
            <p className="text-sm text-slate-400">Review the score summary</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold text-primary">
              {matchState.teamAName}
            </span>
            <span className="text-2xl font-bold text-slate-100">
              {winsA} – {winsB}
            </span>
            <span className="font-semibold text-secondary">
              {matchState.teamBName}
            </span>
          </div>

          {matchState.gameScores.length > 0 ? (
            <ul className="space-y-1.5">
              {matchState.gameScores.map((game) => (
                <li
                  key={game.gameNumber}
                  className="flex justify-between text-sm text-slate-300"
                >
                  <span>Game {game.gameNumber}</span>
                  <span className="font-medium">
                    {game.scoreA} – {game.scoreB}
                    {game.winner && (
                      <span className="ml-2 text-xs text-slate-500">
                        (Team {game.winner})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">
              Current game: {matchState.scoreA} – {matchState.scoreB}
            </p>
          )}

          {!matchState.isMatchComplete && (
            <p className="mt-3 text-xs text-warning">
              Match not finished — needs {gamesNeeded} game wins to complete.
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
            className="flex-1 rounded-xl border border-slate-600 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
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
