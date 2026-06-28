import { Capacitor } from "@capacitor/core";
import type { AuthResponse, Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { formatAuthError } from "./formatAuthError";

type EmailAuthResult = {
  user: User | null;
  session: Session | null;
  error: string | null;
};

async function applySessionFromApi(session: {
  access_token: string;
  refresh_token: string;
}): Promise<Session | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.setSession(session);
  if (error) throw error;
  return data.session;
}

async function signInViaApi(
  email: string,
  password: string
): Promise<EmailAuthResult> {
  const response = await fetch("/api/auth/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json().catch(() => null)) as {
    user?: User;
    session?: { access_token: string; refresh_token: string };
    error?: string;
  } | null;

  if (!response.ok || !payload?.session) {
    return {
      user: null,
      session: null,
      error: payload?.error ?? "Unable to sign in. Try again.",
    };
  }

  try {
    const session = await applySessionFromApi(payload.session);
    return {
      user: payload.user ?? session?.user ?? null,
      session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: formatAuthError(error, "Unable to sign in. Try again."),
    };
  }
}

async function signUpViaApi(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<EmailAuthResult> {
  const response = await fetch("/api/auth/sign-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as {
    user?: User;
    session?: { access_token: string; refresh_token: string };
    error?: string;
    needsEmailConfirmation?: boolean;
  } | null;

  if (!response.ok) {
    return {
      user: null,
      session: null,
      error: payload?.error ?? "Could not create account. Try again.",
    };
  }

  if (payload?.needsEmailConfirmation) {
    return {
      user: null,
      session: null,
      error:
        "Check your email to confirm your account, or disable email confirmation in Supabase Auth settings.",
    };
  }

  if (!payload?.session) {
    return {
      user: null,
      session: null,
      error: "Could not create account. Try again.",
    };
  }

  try {
    const session = await applySessionFromApi(payload.session);
    return {
      user: payload.user ?? session?.user ?? null,
      session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: formatAuthError(error, "Could not create account. Try again."),
    };
  }
}

function useNativeEmailAuthProxy(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

function mapAuthResponse(result: AuthResponse): EmailAuthResult {
  if (result.error) {
    return { user: null, session: null, error: result.error.message };
  }

  return {
    user: result.data.user,
    session: result.data.session,
    error: null,
  };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<EmailAuthResult> {
  if (useNativeEmailAuthProxy()) {
    return signInViaApi(email, password);
  }

  try {
    const supabase = createClient();
    const result = await supabase.auth.signInWithPassword({ email, password });
    return mapAuthResponse(result);
  } catch (error) {
    return {
      user: null,
      session: null,
      error: formatAuthError(error, "Unable to sign in. Try again."),
    };
  }
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<EmailAuthResult> {
  if (useNativeEmailAuthProxy()) {
    return signUpViaApi(input);
  }

  try {
    const supabase = createClient();
    const result = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          role: "player",
        },
      },
    });
    return mapAuthResponse(result);
  } catch (error) {
    return {
      user: null,
      session: null,
      error: formatAuthError(error, "Could not create account. Try again."),
    };
  }
}
