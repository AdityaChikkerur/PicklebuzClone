"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { computeOrganizerStats } from "@/lib/db/admin";
import { isSupabaseConfigured, isUuid } from "@/lib/db/config";
import {
  fetchOrganizerTournaments,
  fetchTournamentRegistrations,
  updateRegistrationStatus,
} from "@/lib/db/tournaments";
import {
  computeFeesCollected,
  countUniquePlayers,
} from "@/lib/mock/adminMockData";
import {
  getOrganizerPendingApprovals,
  getOrganizerTournaments,
  getTournamentRegistrations,
} from "@/lib/mock/tournamentMockData";
import { useAuthStore } from "@/store/authStore";
import type {
  OrganizerPendingApproval,
  OrganizerStats,
} from "@/types/admin";
import type { TournamentDetail, TournamentRegistration } from "@/types/tournament";
import { CATEGORY_TYPE_LABELS } from "@/types/tournament";

export interface UseOrganizerDashboardResult {
  tournaments: TournamentDetail[];
  pendingApprovals: OrganizerPendingApproval[];
  stats: OrganizerStats;
  loading: boolean;
  source: "mock" | "supabase";
  approveRegistration: (registrationId: string, tournamentId: string) => void;
  rejectRegistration: (registrationId: string, tournamentId: string) => void;
}

function categoryLabel(
  tournament: TournamentDetail,
  categoryId: string
): string {
  const cat = tournament.categories.find((c) => c.id === categoryId);
  return cat ? CATEGORY_TYPE_LABELS[cat.categoryType] : categoryId;
}

function mapPendingFromRegistrations(
  tournament: TournamentDetail,
  registrations: TournamentRegistration[]
): OrganizerPendingApproval[] {
  return registrations
    .filter((r) => r.status === "pending")
    .map((r) => ({
      registrationId: r.id,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      playerName: r.playerName,
      partnerName: r.partnerName,
      categoryLabel: categoryLabel(tournament, r.categoryId),
      registeredAt: r.registeredAt,
    }));
}

export function useOrganizerDashboard(): UseOrganizerDashboardResult {
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const [pendingApprovals, setPendingApprovals] = useState<OrganizerPendingApproval[]>(
    getOrganizerPendingApprovals()
  );
  const [tournaments, setTournaments] = useState<TournamentDetail[]>([]);
  const [registrationsByTournament, setRegistrationsByTournament] = useState<
    Map<string, TournamentRegistration[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"mock" | "supabase">("mock");

  const isOrganizer =
    profile?.role === "organizer" || profile?.role === "admin";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (!isOrganizer) {
        setTournaments([]);
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured() || !userId || !isUuid(userId)) {
        if (!cancelled) {
          setTournaments(getOrganizerTournaments());
          setPendingApprovals(getOrganizerPendingApprovals());
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const rows = await fetchOrganizerTournaments(userId);
        const pending: OrganizerPendingApproval[] = [];
        const regMap = new Map<string, TournamentRegistration[]>();

        for (const tournament of rows) {
          const regs = await fetchTournamentRegistrations(tournament.id);
          regMap.set(tournament.id, regs);
          pending.push(...mapPendingFromRegistrations(tournament, regs));
        }

        if (!cancelled) {
          setTournaments(rows);
          setPendingApprovals(pending);
          setRegistrationsByTournament(regMap);
          setSource("supabase");
        }
      } catch {
        if (!cancelled) {
          setTournaments([]);
          setPendingApprovals([]);
          setRegistrationsByTournament(new Map());
          setSource("supabase");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isOrganizer, userId]);

  const stats = useMemo((): OrganizerStats => {
    if (source === "supabase") {
      return computeOrganizerStats(tournaments, registrationsByTournament);
    }

    const ids = tournaments.map((t) => t.id);
    return {
      eventCount: tournaments.length,
      totalPlayers: countUniquePlayers(ids),
      feesCollected: computeFeesCollected(ids),
      pendingApprovals: pendingApprovals.length,
    };
  }, [source, tournaments, registrationsByTournament, pendingApprovals.length]);

  const approveRegistration = useCallback(
    async (registrationId: string, tournamentId: string) => {
      if (source === "supabase") {
        const result = await updateRegistrationStatus(registrationId, "approved");
        if (result.error) {
          toast.error(result.error);
          return;
        }
      }

      setPendingApprovals((prev) =>
        prev.filter((p) => p.registrationId !== registrationId)
      );

      if (source === "supabase") {
        setRegistrationsByTournament((prev) => {
          const next = new Map(prev);
          const regs = next.get(tournamentId) ?? [];
          next.set(
            tournamentId,
            regs.map((r) =>
              r.id === registrationId ? { ...r, status: "approved" as const } : r
            )
          );
          return next;
        });
      }

      const regs =
        source === "mock"
          ? getTournamentRegistrations(tournamentId)
          : registrationsByTournament.get(tournamentId) ?? [];
      const reg = regs.find((r) => r.id === registrationId);
      toast.success(`Approved ${reg?.playerName ?? "registration"}`);
    },
    [source, registrationsByTournament]
  );

  const rejectRegistration = useCallback(
    async (registrationId: string, tournamentId: string) => {
      if (source === "supabase") {
        const result = await updateRegistrationStatus(registrationId, "rejected");
        if (result.error) {
          toast.error(result.error);
          return;
        }
      }

      setPendingApprovals((prev) =>
        prev.filter((p) => p.registrationId !== registrationId)
      );

      if (source === "supabase") {
        setRegistrationsByTournament((prev) => {
          const next = new Map(prev);
          const regs = next.get(tournamentId) ?? [];
          next.set(
            tournamentId,
            regs.map((r) =>
              r.id === registrationId ? { ...r, status: "rejected" as const } : r
            )
          );
          return next;
        });
      }

      const regs =
        source === "mock"
          ? getTournamentRegistrations(tournamentId)
          : registrationsByTournament.get(tournamentId) ?? [];
      const reg = regs.find((r) => r.id === registrationId);
      toast.error(`Rejected ${reg?.playerName ?? "registration"}`);
    },
    [source, registrationsByTournament]
  );

  return {
    tournaments,
    pendingApprovals,
    stats,
    loading,
    source,
    approveRegistration,
    rejectRegistration,
  };
}
