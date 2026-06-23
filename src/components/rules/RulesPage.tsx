"use client";

import { useState } from "react";
import Link from "next/link";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { AppLogo } from "@/components/ui/AppLogo";
import { RULE_SECTIONS } from "./ruleContent";
import { RuleAccordion } from "./RuleAccordion";

export function RulesPage() {
  const [openId, setOpenId] = useState<string | null>(RULE_SECTIONS[0]?.id ?? null);

  const handleToggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <AppLogo href="/" iconSize={36} />
          <Link href="/auth" className="text-sm font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            Basic pickleball rules
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            A quick reference for new players. PickleBuzz supports rally and
            side-out scoring — configure your match in setup.
          </p>
        </div>

        <RuleAccordion
          sections={RULE_SECTIONS}
          openId={openId}
          onToggle={handleToggle}
        />

        <div className="card-base mt-8 flex flex-col gap-3 border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <AdjustmentsHorizontalIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Custom local rules
              </h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                House rules, coaching limits, or venue-specific quirks? Add them
                when you create a match so everyone sees them before play starts.
              </p>
            </div>
          </div>
          <Link href="/match-setup" className="btn-primary shrink-0 text-center text-sm">
            Match setup
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
      </footer>
    </div>
  );
}
