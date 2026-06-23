import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { isUuid } from "@/lib/db/config";

export type AppDataSource = "supabase" | "mock" | "local";

/** True when env points at a real Supabase project (not placeholder values). */
export function isLiveBackend(): boolean {
  return isSupabaseConfigured();
}

/**
 * Demo routes use non-UUID ids (`club-1`, `m-live`, etc.).
 * Those should keep inline mock data even when Supabase is configured.
 */
export function shouldFetchFromDb(entityId: string): boolean {
  return isSupabaseConfigured() && isUuid(entityId);
}
