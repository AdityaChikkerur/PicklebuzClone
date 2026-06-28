import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";

/** Auth headers for same-origin API calls from Capacitor (localStorage session). */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return {};

  return { Authorization: `Bearer ${session.access_token}` };
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const authHeaders = await getAuthHeaders();

  return fetch(input, {
    ...init,
    credentials: init?.credentials ?? "include",
    headers: {
      ...authHeaders,
      ...(init?.headers ?? {}),
    },
  });
}
