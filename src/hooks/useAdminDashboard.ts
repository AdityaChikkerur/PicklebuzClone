"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import {

  fetchAdminDisputes,

  fetchAdminStats,

  fetchAdminTournaments,

  fetchAdminUsers,

  fetchFlaggedMatches,

  flagMatchScore,

  resolveDispute as resolveDisputeDb,

  updateProfileFlag,

  updateTournamentFlag,

} from "@/lib/db/admin";

import { isSupabaseConfigured } from "@/lib/db/config";

import {

  MOCK_ADMIN_DISPUTES,

  MOCK_ADMIN_USERS,

  buildAdminTournamentRows,

  computeAdminStats,

} from "@/lib/mock/adminMockData";

import { useAuthStore } from "@/store/authStore";

import type {

  AdminDispute,

  AdminStats,

  AdminTournamentRow,

  AdminUser,

  DisputeResolution,

} from "@/types/admin";



export interface UseAdminDashboardResult {

  stats: AdminStats;

  loading: boolean;

  source: "mock" | "supabase";

}



export function useAdminDashboard(): UseAdminDashboardResult {

  const profile = useAuthStore((s) => s.profile);

  const [stats, setStats] = useState<AdminStats>({

    userCount: 0,

    tournamentCount: 0,

    clubCount: 0,

    openDisputes: 0,

  });

  const [loading, setLoading] = useState(true);

  const [source, setSource] = useState<"mock" | "supabase">("mock");



  const isAdmin = profile?.role === "admin";



  useEffect(() => {

    let cancelled = false;



    async function load() {

      setLoading(true);



      if (!isAdmin) {

        if (!cancelled) {

          setStats({

            userCount: 0,

            tournamentCount: 0,

            clubCount: 0,

            openDisputes: 0,

          });

          setLoading(false);

        }

        return;

      }



      if (!isSupabaseConfigured()) {

        if (!cancelled) {

          setStats(

            computeAdminStats(

              MOCK_ADMIN_USERS,

              MOCK_ADMIN_DISPUTES,

              buildAdminTournamentRows()

            )

          );

          setSource("mock");

          setLoading(false);

        }

        return;

      }



      try {

        const liveStats = await fetchAdminStats();

        if (!cancelled) {

          setStats(liveStats);

          setSource("supabase");

        }

      } catch {

        if (!cancelled) {

          setStats({

            userCount: 0,

            tournamentCount: 0,

            clubCount: 0,

            openDisputes: 0,

          });

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

  }, [isAdmin]);



  return { stats, loading, source };

}



export interface UseAdminUsersResult {

  users: AdminUser[];

  loading: boolean;

  source: "mock" | "supabase";

  search: string;

  setSearch: (q: string) => void;

  toggleBan: (id: string) => void;

  toggleVerify: (id: string) => void;

  toggleBoost: (id: string) => void;

}



export function useAdminUsers(): UseAdminUsersResult {

  const profile = useAuthStore((s) => s.profile);

  const [users, setUsers] = useState(MOCK_ADMIN_USERS);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [source, setSource] = useState<"mock" | "supabase">("mock");



  const isAdmin = profile?.role === "admin";



  useEffect(() => {

    let cancelled = false;



    async function load() {

      setLoading(true);



      if (!isAdmin) {

        if (!cancelled) setLoading(false);

        return;

      }



      if (!isSupabaseConfigured()) {

        if (!cancelled) {

          setUsers(MOCK_ADMIN_USERS);

          setSource("mock");

          setLoading(false);

        }

        return;

      }



      try {

        const rows = await fetchAdminUsers();

        if (!cancelled) {

          setUsers(rows);

          setSource("supabase");

        }

      } catch {

        if (!cancelled) setUsers([]);

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    void load();

    return () => {

      cancelled = true;

    };

  }, [isAdmin]);



  const filtered = useMemo(() => {

    if (!isAdmin) return [];

    const q = search.trim().toLowerCase();

    if (!q) return users;

    return users.filter(

      (u) =>

        u.fullName.toLowerCase().includes(q) ||

        u.email.toLowerCase().includes(q) ||

        u.city.toLowerCase().includes(q) ||

        u.role.includes(q)

    );

  }, [users, search, isAdmin]);



  const persistFlag = useCallback(

    async (

      id: string,

      flag: "verified" | "banned" | "boosted",

      value: boolean,

      patch: Partial<AdminUser>

    ) => {

      if (source === "supabase") {

        const result = await updateProfileFlag(id, flag, value);

        if (result.error) {

          toast.error(result.error);

          return false;

        }

      }

      setUsers((prev) =>

        prev.map((u) => (u.id === id ? { ...u, ...patch } : u))

      );

      return true;

    },

    [source]

  );



  const toggleBan = useCallback(

    (id: string) => {

      const user = users.find((u) => u.id === id);

      if (!user) return;

      void persistFlag(id, "banned", !user.banned, { banned: !user.banned });

    },

    [users, persistFlag]

  );



  const toggleVerify = useCallback(

    (id: string) => {

      const user = users.find((u) => u.id === id);

      if (!user) return;

      void persistFlag(id, "verified", !user.verified, {

        verified: !user.verified,

      });

    },

    [users, persistFlag]

  );



  const toggleBoost = useCallback(

    (id: string) => {

      const user = users.find((u) => u.id === id);

      if (!user) return;

      void persistFlag(id, "boosted", !user.boosted, { boosted: !user.boosted });

    },

    [users, persistFlag]

  );



  return {

    users: filtered,

    loading,

    source,

    search,

    setSearch,

    toggleBan,

    toggleVerify,

    toggleBoost,

  };

}



export interface UseAdminDisputesResult {

  disputes: AdminDispute[];

  loading: boolean;

  source: "mock" | "supabase";

  resolveDispute: (id: string, resolution: DisputeResolution) => void;

}



export function useAdminDisputes(): UseAdminDisputesResult {

  const profile = useAuthStore((s) => s.profile);

  const [disputes, setDisputes] = useState(MOCK_ADMIN_DISPUTES);

  const [loading, setLoading] = useState(true);

  const [source, setSource] = useState<"mock" | "supabase">("mock");



  const isAdmin = profile?.role === "admin";



  useEffect(() => {

    let cancelled = false;



    async function load() {

      setLoading(true);



      if (!isAdmin) {

        if (!cancelled) setLoading(false);

        return;

      }



      if (!isSupabaseConfigured()) {

        if (!cancelled) {

          setDisputes(MOCK_ADMIN_DISPUTES);

          setSource("mock");

          setLoading(false);

        }

        return;

      }



      try {

        const rows = await fetchAdminDisputes();

        if (!cancelled) {

          setDisputes(rows);

          setSource("supabase");

        }

      } catch {

        if (!cancelled) setDisputes([]);

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    void load();

    return () => {

      cancelled = true;

    };

  }, [isAdmin]);



  const resolveDispute = useCallback(

    async (id: string, resolution: DisputeResolution) => {

      if (source === "supabase") {

        const result = await resolveDisputeDb(id, resolution);

        if (result.error) {

          toast.error(result.error);

          return;

        }

      }



      setDisputes((prev) =>

        prev.map((d) =>

          d.id === id

            ? { ...d, status: "resolved" as const, resolution }

            : d

        )

      );

    },

    [source]

  );



  return {

    disputes: isAdmin ? disputes : [],

    loading,

    source,

    resolveDispute,

  };

}



export interface UseAdminTournamentsResult {

  tournaments: AdminTournamentRow[];

  loading: boolean;

  source: "mock" | "supabase";

  toggleFeatured: (id: string) => void;

  toggleArchived: (id: string) => void;

}



export function useAdminTournaments(): UseAdminTournamentsResult {

  const profile = useAuthStore((s) => s.profile);

  const [tournaments, setTournaments] = useState(buildAdminTournamentRows());

  const [loading, setLoading] = useState(true);

  const [source, setSource] = useState<"mock" | "supabase">("mock");



  const isAdmin = profile?.role === "admin";



  useEffect(() => {

    let cancelled = false;



    async function load() {

      setLoading(true);



      if (!isAdmin) {

        if (!cancelled) setLoading(false);

        return;

      }



      if (!isSupabaseConfigured()) {

        if (!cancelled) {

          setTournaments(buildAdminTournamentRows());

          setSource("mock");

          setLoading(false);

        }

        return;

      }



      try {

        const rows = await fetchAdminTournaments();

        if (!cancelled) {

          setTournaments(rows);

          setSource("supabase");

        }

      } catch {

        if (!cancelled) setTournaments([]);

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    void load();

    return () => {

      cancelled = true;

    };

  }, [isAdmin]);



  const toggleFeatured = useCallback(

    (id: string) => {

      const tournament = tournaments.find((t) => t.id === id);

      if (!tournament) return;

      const next = !tournament.featured;



      void (async () => {

        if (source === "supabase") {

          const result = await updateTournamentFlag(id, "featured", next);

          if (result.error) {

            toast.error(result.error);

            return;

          }

        }

        setTournaments((prev) =>

          prev.map((t) => (t.id === id ? { ...t, featured: next } : t))

        );

      })();

    },

    [tournaments, source]

  );



  const toggleArchived = useCallback(

    (id: string) => {

      const tournament = tournaments.find((t) => t.id === id);

      if (!tournament) return;

      const next = !tournament.archived;



      void (async () => {

        if (source === "supabase") {

          const result = await updateTournamentFlag(id, "archived", next);

          if (result.error) {

            toast.error(result.error);

            return;

          }

        }

        setTournaments((prev) =>

          prev.map((t) => (t.id === id ? { ...t, archived: next } : t))

        );

      })();

    },

    [tournaments, source]

  );



  return {

    tournaments: isAdmin ? tournaments : [],

    loading,

    source,

    toggleFeatured,

    toggleArchived,

  };

}

export interface UseAdminFlaggedMatchesResult {
  matches: import("@/lib/db/admin").FlaggedMatch[];
  loading: boolean;
  toggleFlag: (matchId: string, flagged: boolean) => Promise<boolean>;
}

export function useAdminFlaggedMatches(): UseAdminFlaggedMatchesResult {
  const profile = useAuthStore((s) => s.profile);
  const [matches, setMatches] = useState<
    import("@/lib/db/admin").FlaggedMatch[]
  >([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = profile?.role === "admin";

  const reload = useCallback(async () => {
    if (!isAdmin) {
      setMatches([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const rows = await fetchFlaggedMatches();
    setMatches(rows);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggleFlag = useCallback(
    async (matchId: string, flagged: boolean) => {
      const result = await flagMatchScore(matchId, flagged);
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      setMatches((prev) =>
        flagged ? prev : prev.filter((m) => m.id !== matchId)
      );
      return true;
    },
    []
  );

  return { matches, loading, toggleFlag };
}