"use client";

import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface PublishSuccessScreenProps {
  tournamentName: string;
  tournamentId: string | null;
  onCreateAnother: () => void;
}

export function PublishSuccessScreen({
  tournamentName,
  tournamentId,
  onCreateAnother,
}: PublishSuccessScreenProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircleIcon className="h-10 w-10 text-primary" aria-hidden="true" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground">Tournament published!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{tournamentName}</span> is now
          live. Players can discover it and register before the deadline.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        {tournamentId ? (
          <Link href={`/tournament/${tournamentId}`} className="btn-primary flex-1 text-center">
            View tournament
          </Link>
        ) : (
          <Link href="/dashboard" className="btn-primary flex-1 text-center">
            Go to Dashboard
          </Link>
        )}
        <button type="button" onClick={onCreateAnother} className="btn-outline flex-1">
          Create Another
        </button>
      </div>
    </div>
  );
}
