"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { UserPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { fetchDiscoveryPlayers } from "@/lib/db/players";
import {
  fetchTournamentAdmins,
  inviteTournamentAdmin,
  revokeTournamentAdmin,
  type TournamentAdmin,
} from "@/lib/db/tournamentAdmins";
import { useAuthStore } from "@/store/authStore";
import type { Player } from "@/types/player";

interface TournamentAdminsPanelProps {
  tournamentId: string;
  tournamentName: string;
  canManage: boolean;
}

function statusVariant(
  status: TournamentAdmin["status"]
): "success" | "warning" | "outline" {
  switch (status) {
    case "accepted":
      return "success";
    case "pending":
      return "warning";
    default:
      return "outline";
  }
}

export function TournamentAdminsPanel({
  tournamentId,
  tournamentName,
  canManage,
}: TournamentAdminsPanelProps) {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const [admins, setAdmins] = useState<TournamentAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Player[]>([]);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState<"admin" | "scorer">("admin");

  const reload = async () => {
    const result = await fetchTournamentAdmins(tournamentId);
    if (result.data) setAdmins(result.data);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, [tournamentId]);

  const activeAdmins = useMemo(
    () => admins.filter((a) => a.status !== "declined"),
    [admins]
  );

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const players = await fetchDiscoveryPlayers({
      search: search.trim(),
      excludeUserId: userId,
    });
    const existingIds = new Set(admins.map((a) => a.userId));
    setResults(players.filter((p) => !existingIds.has(p.id)).slice(0, 8));
    setSearching(false);
  };

  const handleInvite = async (player: Player) => {
    if (!userId) {
      toast.error("Sign in to invite admins");
      return;
    }
    setInvitingId(player.id);
    const result = await inviteTournamentAdmin({
      tournamentId,
      userId: player.id,
      invitedBy: userId,
      tournamentName,
      role: inviteRole,
    });
    setInvitingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      `Invited ${player.fullName} as ${inviteRole === "scorer" ? "scorer" : "co-admin"}`
    );
    setOpen(false);
    setSearch("");
    setResults([]);
    void reload();
  };

  const handleRevoke = async (adminId: string) => {
    const result = await revokeTournamentAdmin(adminId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Admin access removed");
    void reload();
  };

  if (!canManage && activeAdmins.length === 0) return null;

  return (
    <div className="card-base flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-foreground">Tournament admins</p>
          <p className="text-xs text-muted-foreground">
            Co-admins can approve players, start matches on multiple courts, and
            delegate scorers — like CricHeroes tournament management.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn-outline shrink-0 text-xs"
          >
            <UserPlusIcon className="mr-1 inline h-4 w-4" aria-hidden="true" />
            Add admin
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading admins…</p>
      ) : activeAdmins.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Only you can manage this tournament. Add co-admins for multi-court events.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {activeAdmins.map((admin) => (
            <li
              key={admin.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {admin.fullName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {admin.role} · {admin.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(admin.status)}>
                  {admin.status}
                </Badge>
                {canManage && admin.userId !== userId && (
                  <button
                    type="button"
                    onClick={() => void handleRevoke(admin.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Remove ${admin.fullName}`}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canManage && open && (
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="mb-2 flex gap-2">
            <button
              type="button"
              onClick={() => setInviteRole("admin")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                inviteRole === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Co-admin
            </button>
            <button
              type="button"
              onClick={() => setInviteRole("scorer")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                inviteRole === "scorer"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Scorer
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSearch();
              }}
              placeholder="Search by name, city, or phone…"
              className="input-base flex-1 text-sm"
            />
            <button
              type="button"
              onClick={() => void handleSearch()}
              disabled={searching}
              className="btn-primary shrink-0 text-sm"
            >
              {searching ? "…" : "Search"}
            </button>
          </div>
          {results.length > 0 && (
            <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-card">
              {results.map((player) => (
                <li key={player.id}>
                  <button
                    type="button"
                    disabled={invitingId === player.id}
                    onClick={() => void handleInvite(player)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
                  >
                    <span className="font-medium">{player.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {invitingId === player.id ? "Inviting…" : "Invite"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
