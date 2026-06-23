"use client";

import { usePlayerStats } from "@/hooks/usePlayerStats";
import { cn } from "@/lib/utils";

export function CurrentFormStrip() {
  const { currentForm, loading } = usePlayerStats();

  return (
    <div className="card-base p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-foreground">Current Form</h2>
        <span className="text-xs text-muted-foreground">Last 10 matches</span>
      </div>
      {loading ? (
        <div className="flex gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : currentForm.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Play and verify a match to see your form here.
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {currentForm.map((result, index) => (
            <div
              key={`${result}-${index}`}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                result === "W"
                  ? "bg-success/15 text-success"
                  : "bg-danger/15 text-danger"
              )}
              title={`Match ${index + 1}: ${result === "W" ? "Win" : "Loss"}`}
              aria-label={`Match ${index + 1}: ${result === "W" ? "Win" : "Loss"}`}
            >
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
