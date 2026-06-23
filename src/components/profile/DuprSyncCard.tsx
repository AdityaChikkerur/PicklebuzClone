"use client";

import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { cn, formatDupr } from "@/lib/utils";
import { isDuprConfigured } from "@/lib/dupr/isDuprConfigured";
import { useDuprSync } from "@/hooks/useRefereeDashboard";

interface DuprSyncCardProps {
  duprRating: number;
  duprId?: string | null;
  syncedAt?: string | null;
  onSynced?: (rating: number) => void;
  className?: string;
}

export function DuprSyncCard({
  duprRating,
  duprId,
  syncedAt,
  onSynced,
  className,
}: DuprSyncCardProps) {
  const [inputId, setInputId] = useState(duprId ?? "");
  const { syncing, syncDupr } = useDuprSync();
  const apiLive = isDuprConfigured();

  const handleSync = async () => {
    const result = await syncDupr(inputId.trim());
    if (result?.duprRating != null) {
      onSynced?.(result.duprRating);
    }
  };

  return (
    <div className={cn("card-base flex flex-col gap-4 p-4", className)}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">DUPR sync</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Link your DUPR account to pull your official rating into PickleBuzz.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
        <span className="text-sm text-muted-foreground">Current rating</span>
        <span className="text-sm font-bold text-foreground">
          {formatDupr(duprRating)}
        </span>
      </div>

      {syncedAt && (
        <p className="text-xs text-muted-foreground">
          Last synced {new Date(syncedAt).toLocaleDateString("en-IN")}
        </p>
      )}

      <div>
        <label htmlFor="dupr-id" className="mb-1.5 block text-sm font-medium">
          DUPR ID
        </label>
        <input
          id="dupr-id"
          type="text"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          placeholder="e.g. 3ABC1234"
          className="input-base"
        />
      </div>

      <button
        type="button"
        onClick={() => void handleSync()}
        disabled={syncing || !inputId.trim()}
        className="btn-primary inline-flex items-center justify-center gap-2"
      >
        <ArrowPathIcon
          className={cn("h-4 w-4", syncing && "animate-spin")}
          aria-hidden="true"
        />
        {syncing ? "Syncing…" : "Sync from DUPR"}
      </button>

      <p className="text-[10px] text-muted-foreground">
        {apiLive
          ? "Connected to DUPR API — ratings update on sync."
          : "Demo mode — enter any ID to simulate a sync."}
      </p>
    </div>
  );
}
