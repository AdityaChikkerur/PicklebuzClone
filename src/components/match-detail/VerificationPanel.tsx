"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  confirmMatchResult,
  disputeMatchResult,
} from "@/lib/db/matches";
import { fetchProfileById } from "@/lib/db/profiles";
import { useAuthStore } from "@/store/authStore";
import type { MatchDetail, MatchStatus } from "@/types/match";
import { cn } from "@/lib/utils";

interface VerificationPanelProps {
  match: MatchDetail;
  onStatusChange?: (status: MatchStatus) => void;
  className?: string;
}

export function VerificationPanel({
  match,
  onStatusChange,
  className,
}: VerificationPanelProps) {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [busy, setBusy] = useState<"confirm" | "dispute" | null>(null);

  const handleConfirm = async () => {
    setBusy("confirm");
    const result = await confirmMatchResult(match.id);
    setBusy(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (userId) {
      const refreshed = await fetchProfileById(userId);
      if (refreshed.data) {
        setProfile(refreshed.data);
      }
    }

    toast.success("Result confirmed. Rating and stats updated");
    onStatusChange?.("verified");
  };

  const handleDispute = async () => {
    setBusy("dispute");
    const result = await disputeMatchResult(
      match.id,
      userId ?? "00000000-0000-0000-0000-000000000000",
      "Opponent disputed the submitted score"
    );
    setBusy(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.error("Dispute raised. Admin will review");
    onStatusChange?.("disputed");
  };

  if (match.status === "verified" || match.status === "completed") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4",
          className
        )}
      >
        <CheckCircleIcon className="h-6 w-6 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold text-primary">Verified result</p>
          <p className="text-sm text-muted-foreground">
            This match counts toward official stats and rankings.
          </p>
        </div>
      </div>
    );
  }

  if (match.status === "disputed") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4",
          className
        )}
      >
        <ExclamationTriangleIcon className="h-6 w-6 shrink-0 text-danger" aria-hidden />
        <div>
          <p className="font-semibold text-danger">Result disputed</p>
          <p className="text-sm text-muted-foreground">
            An admin will review and resolve this match. Stats are on hold.
          </p>
        </div>
      </div>
    );
  }

  if (match.status === "pending" && match.isCurrentUserOpponent) {
    return (
      <div className={cn("card-base p-5", className)}>
        <p className="mb-1 font-semibold text-foreground">Confirm result</p>
        <p className="mb-4 text-sm text-muted-foreground">
          The match creator submitted this score. Confirm if correct, or dispute if not.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={busy !== null}
            className="btn-primary flex-1"
            aria-label="Confirm match result"
          >
            {busy === "confirm" ? "Confirming…" : "Confirm"}
          </button>
          <button
            type="button"
            onClick={() => void handleDispute()}
            disabled={busy !== null}
            className="btn-outline flex-1 border-danger text-danger hover:bg-danger hover:text-white"
            aria-label="Dispute match result"
          >
            {busy === "dispute" ? "Submitting…" : "Dispute"}
          </button>
        </div>
      </div>
    );
  }

  if (match.status === "pending" && match.isCurrentUserCreator) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4",
          className
        )}
      >
        <XCircleIcon className="h-6 w-6 shrink-0 text-warning" aria-hidden />
        <div>
          <p className="font-semibold text-warning">Awaiting opponent confirmation</p>
          <p className="text-sm text-muted-foreground">
            Your opponent must confirm before this result becomes official.
          </p>
        </div>
      </div>
    );
  }

  if (match.status === "live") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="badge-live">LIVE</span>
        <span className="text-sm text-muted-foreground">Match in progress</span>
      </div>
    );
  }

  return null;
}
