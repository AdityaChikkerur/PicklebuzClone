import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";

/** Demo cookies / demo-session API are for local UI exploration only — never in production. */
export function isDemoAuthAllowed(): boolean {
  if (process.env.E2E_DEMO_AUTH === "1") return true;
  if (process.env.NODE_ENV === "production") return false;
  if (isSupabaseConfigured()) return false;
  return true;
}
