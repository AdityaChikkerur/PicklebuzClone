"use client";

import { AppLayout } from "@/components/layout";
import { TournamentWizard } from "./TournamentWizard";

export function CreateTournamentPage() {
  return (
    <AppLayout title="Create Tournament">
      <div className="mb-2">
        <p className="text-sm text-muted-foreground">New tournament</p>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          Tournament setup
        </h2>
      </div>
      <TournamentWizard />
    </AppLayout>
  );
}
