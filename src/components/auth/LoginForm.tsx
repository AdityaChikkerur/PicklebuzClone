"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { persistDemoAuth } from "@/lib/auth/persistDemoAuth";
import { useAuthStore } from "@/store/authStore";
import { DEMO_CREDENTIALS, type DemoCredential } from "@/types/player";
import { cn } from "@/lib/utils";
import { clearDemoSession } from "@/lib/auth/demoSession";
import { sanitizeRedirectPath } from "@/lib/auth/routeGuards";
import { mapDbProfile, type DbProfileRow } from "@/lib/db/profileMapper";
import { DemoCredentialsPanel } from "./DemoCredentialsPanel";
import { buildDemoProfile, buildMockUser } from "./authHelpers";
import { loginSchema, type LoginFormValues } from "./schemas";

interface LoginFormProps {
  className?: string;
}

async function establishDemoSession(
  cred: DemoCredential,
  redirectTo: string
): Promise<boolean> {
  const res = await fetch("/api/auth/demo-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: cred.email, password: cred.password }),
    credentials: "same-origin",
  });

  if (!res.ok) return false;

  const profile = buildDemoProfile(cred);
  const user = buildMockUser(cred.email, profile.id);
  persistDemoAuth(user, profile);

  toast.success(`Welcome back, ${cred.label}!`);
  window.location.assign(redirectTo);
  return true;
}

export function LoginForm({ className }: LoginFormProps) {
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const [submitting, setSubmitting] = useState(false);
  const loginInFlight = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const redirectParam = searchParams.get("redirect");

  const completeDemoLogin = async (cred: DemoCredential) => {
    if (loginInFlight.current) return;
    loginInFlight.current = true;

    setUser(buildMockUser(cred.email));
    setProfile(buildDemoProfile(cred));
    setLoading(false);

    const ok = await establishDemoSession(cred, sanitizeRedirectPath(redirectParam, cred.role));
    if (!ok) {
      loginInFlight.current = false;
      toast.error("Could not start demo session. Try again.");
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    if (submitting || loginInFlight.current) return;
    setSubmitting(true);

    const demoMatch =
      !isSupabaseConfigured() &&
      DEMO_CREDENTIALS.find(
        (c) => c.email === values.email && c.password === values.password
      );

    if (demoMatch) {
      await completeDemoLogin(demoMatch);
      setSubmitting(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      toast.error("Invalid email or password.");
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      if (data.user) {
        clearDemoSession();
        setUser(data.user);
        setLoading(false);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError || !profileData) {
          toast.error("Signed in but could not load profile");
        } else {
          const mapped = mapDbProfile(profileData as DbProfileRow);
          setProfile(mapped);
          toast.success("Welcome back!");
          window.location.assign(
            sanitizeRedirectPath(redirectParam, mapped.role)
          );
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in. Try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSelect = (cred: DemoCredential) => {
    setValue("email", cred.email);
    setValue("password", cred.password);
    void completeDemoLogin(cred);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className="input-base"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className="input-base"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || loginInFlight.current}
          className="btn-primary w-full"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>

      {!isSupabaseConfigured() ? (
        <DemoCredentialsPanel onSelect={handleDemoSelect} />
      ) : null}
    </div>
  );
}

