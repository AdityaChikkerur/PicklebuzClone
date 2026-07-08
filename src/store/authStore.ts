import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { performSignOut } from "@/lib/auth/signOutClient";
import type { Profile } from "@/types/player";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  connectionError: string | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setConnectionError: (connectionError: string | null) => void;
  clearAuth: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  connectionError: null,

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  setLoading: (loading) => set({ loading }),

  setConnectionError: (connectionError) => set({ connectionError }),

  clearAuth: () =>
    set({ user: null, profile: null, loading: false, connectionError: null }),

  signOut: async () => {
    await performSignOut();
    set({ user: null, profile: null, loading: false, connectionError: null });
  },
}));
