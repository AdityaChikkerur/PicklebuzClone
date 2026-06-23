"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout";
import { useMatchStore } from "@/store/matchStore";
import { ActionButtons } from "./ActionButtons";
import { EndMatchModal } from "./EndMatchModal";
import { FaultCounters } from "./FaultCounters";
import { LiveScoringHeader } from "./LiveScoringHeader";
import { MatchEventsFeed } from "./MatchEventsFeed";
import { MatchInfoBar } from "./MatchInfoBar";
import { MatchRuleChips } from "./MatchRuleChips";
import { ScoreDisplay } from "./ScoreDisplay";
import { TimeoutBar } from "./TimeoutBar";

export function LiveScoringPage() {
  const matchState = useMatchStore((s) => s.matchState);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    if (matchState.isMatchComplete) {
      setEndModalOpen(true);
    }
  }, [matchState.isMatchComplete]);

  return (
    <AppLayout hideNav>
      <div className="fixed inset-0 mx-auto flex max-w-lg flex-col bg-foreground text-slate-100">
        <LiveScoringHeader
          matchState={matchState}
          onEndMatch={() => setEndModalOpen(true)}
          onShowTimeline={() => setShowTimeline((v) => !v)}
        />

        <MatchRuleChips matchState={matchState} />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <ScoreDisplay matchState={matchState} />
          <MatchInfoBar matchState={matchState} />
          <ActionButtons />
          <TimeoutBar />
          <FaultCounters matchState={matchState} />
          {showTimeline && (
            <div className="slide-up border-t border-slate-700/80">
              <MatchEventsFeed events={matchState.events} />
            </div>
          )}
        </div>

        <div className="border-t border-slate-700/80 px-4 py-2 text-center">
          <Link
            href="/match-setup"
            className="text-[11px] font-semibold text-slate-500 hover:text-primary"
          >
            New match setup →
          </Link>
        </div>

        <EndMatchModal
          open={endModalOpen}
          matchState={matchState}
          onClose={() => setEndModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
