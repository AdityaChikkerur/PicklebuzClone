"use client";

import { useEffect, useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { TournamentRegistration } from "@/types/tournament";

interface ParticipantsManagerProps {
  registrations: TournamentRegistration[];
  isOrganizer: boolean;
  onApprove?: (registrationId: string) => Promise<boolean>;
  onReject?: (registrationId: string) => Promise<boolean>;
}

function statusVariant(
  status: TournamentRegistration["status"]
): "success" | "warning" | "danger" {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
  }
}

export function ParticipantsManager({
  registrations: initial,
  isOrganizer,
  onApprove,
  onReject,
}: ParticipantsManagerProps) {
  const [registrations, setRegistrations] = useState(initial);
  const pendingCount = registrations.filter((r) => r.status === "pending").length;

  useEffect(() => {
    setRegistrations(initial);
  }, [initial]);

  const updateRegistration = (
    id: string,
    patch: Partial<TournamentRegistration>
  ) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  const handleApprove = async (id: string) => {
    if (onApprove) {
      const ok = await onApprove(id);
      if (!ok) return;
    } else {
      updateRegistration(id, { status: "approved" });
    }
    toast.success("Registration approved");
  };

  const handleReject = async (id: string) => {
    if (onReject) {
      const ok = await onReject(id);
      if (!ok) return;
    } else {
      updateRegistration(id, { status: "rejected" });
    }
    toast.error("Registration rejected");
  };

  const handleSeedChange = (id: string, seed: number) => {
    updateRegistration(id, { seed: seed || undefined });
  };

  const handleGenerateFixtures = () => {
    toast.success("Fixtures generated (demo)", {
      description: "Schedule published to all approved participants.",
    });
  };

  if (registrations.length === 0) {
    return (
      <div className="card-base p-8 text-center">
        <p className="text-sm font-medium text-foreground">No participants yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Share the tournament link to start collecting registrations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {isOrganizer && (
        <div className="card-base flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">Organizer controls</p>
            <p className="text-xs text-muted-foreground">
              {pendingCount > 0
                ? `${pendingCount} pending approval`
                : "All registrations reviewed"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateFixtures}
            className="btn-primary text-sm"
          >
            Generate Fixtures
          </button>
        </div>
      )}

      <div className="card-base divide-y divide-border overflow-hidden">
        <ul>
          {registrations.map((reg) => (
            <li key={reg.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={reg.playerAvatarUrl}
                    name={reg.playerName}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {reg.playerName}
                      {reg.partnerName && (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          & {reg.partnerName}
                        </span>
                      )}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(reg.status)}>{reg.status}</Badge>
                      {reg.seed != null && (
                        <span className="text-xs text-muted-foreground">
                          Seed #{reg.seed}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isOrganizer && reg.status === "pending" && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => void handleApprove(reg.id)}
                      className="rounded-lg bg-success/10 p-2 text-success hover:bg-success/20"
                      aria-label={`Approve ${reg.playerName}`}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReject(reg.id)}
                      className="rounded-lg bg-danger/10 p-2 text-danger hover:bg-danger/20"
                      aria-label={`Reject ${reg.playerName}`}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {isOrganizer && reg.status === "approved" && (
                <div className="mt-3 flex items-center gap-2">
                  <label
                    htmlFor={`seed-${reg.id}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Seed
                  </label>
                  <input
                    id={`seed-${reg.id}`}
                    type="number"
                    min={1}
                    max={32}
                    value={reg.seed ?? ""}
                    onChange={(e) =>
                      handleSeedChange(reg.id, parseInt(e.target.value, 10) || 0)
                    }
                    className={cn(
                      "input-base w-20 py-1.5 text-center text-sm"
                    )}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
