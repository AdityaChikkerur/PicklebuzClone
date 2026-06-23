"use client";

import { AppLayout } from "@/components/layout";
import { MatchSetupWizard } from "./MatchSetupWizard";

export function MatchSetupPage() {
  return (
    <AppLayout title="Create Match">
      <div className="mb-2">
        <p className="text-sm text-muted-foreground">New match</p>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          Match setup
        </h2>
      </div>
      <MatchSetupWizard />
    </AppLayout>
  );
}
