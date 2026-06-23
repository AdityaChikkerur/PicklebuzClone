import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { clearDemoSession } from "@/lib/auth/demoSession";
import { clearPersistedDemoAuth } from "@/lib/auth/persistDemoAuth";
import { createClient } from "@/lib/supabase";
import type { Profile } from "@/types/player";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  setLoading: (loading) => set({ loading }),

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearDemoSession();
    clearPersistedDemoAuth();
    set({ user: null, profile: null });
  },
}));
