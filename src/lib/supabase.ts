import { Capacitor } from "@capacitor/core";
import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let nativeClient: ReturnType<typeof createSupabaseClient> | null = null;

function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}

function createNativeClient() {
  const { url, key } = getSupabaseEnv();

  if (!nativeClient) {
    nativeClient = createSupabaseClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    });
  }

  return nativeClient;
}

export function createClient() {
  const { url, key } = getSupabaseEnv();

  if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
    return createNativeClient();
  }

  return createBrowserClient(url, key);
}
