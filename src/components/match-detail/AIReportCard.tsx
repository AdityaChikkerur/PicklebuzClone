"use client";

import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { generateReport, generateReportAI } from "@/lib/aiReport";
import type { MatchDetail } from "@/types/match";
import { cn } from "@/lib/utils";

interface AIReportCardProps {
  match: MatchDetail;
  className?: string;
}

export function AIReportCard({ match, className }: AIReportCardProps) {
  const [richReport, setRichReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lines = generateReport({
    teamAName: match.teamAName,
    teamBName: match.teamBName,
    matchWinner: match.winner,
    gameScores: match.gameScores,
    events: match.events,
    players: match.players,
    stats: match.stats,
  });

  const handleRichReport = async () => {
    setLoading(true);
    try {
      const report = await generateReportAI({
        teamAName: match.teamAName,
        teamBName: match.teamBName,
        matchWinner: match.winner,
        gameScores: match.gameScores,
        events: match.events,
        players: match.players,
        stats: match.stats,
      });
      setRichReport(report);
      toast.success("Richer AI report generated");
    } catch {
      toast.error("Could not generate AI report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("card-base p-5", className)}>
      <div className="mb-3 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-base font-semibold text-foreground">AI Match Report</h2>
      </div>

      <ul className="space-y-2 text-sm text-foreground">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {match.hasComeback && (
        <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
          Comeback detected — the winner recovered after losing an earlier game.
        </p>
      )}

      {match.bestPerformer && (
        <p className="mt-2 text-xs text-muted-foreground">
          Best performer: <span className="font-semibold text-foreground">{match.bestPerformer}</span>
        </p>
      )}

      {richReport ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/50 p-3 text-sm whitespace-pre-line">
          {richReport}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleRichReport}
          disabled={loading}
          className="btn-outline mt-4 w-full text-sm"
          aria-label="Generate richer AI match report"
        >
          {loading ? "Generating…" : "Generate richer report"}
        </button>
      )}
    </div>
  );
}
