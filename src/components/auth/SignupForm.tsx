"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { clearDemoSession } from "@/lib/auth/demoSession";
import { persistDemoAuth } from "@/lib/auth/persistDemoAuth";
import { sanitizeRedirectPath } from "@/lib/auth/routeGuards";
import { buildMockUser, buildSignupProfile } from "./authHelpers";
import { signupSchema, type SignupFormValues } from "./schemas";

interface SignupFormProps {
  className?: string;
}

export function SignupForm({ className }: SignupFormProps) {
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const postLoginPath = sanitizeRedirectPath(searchParams.get("redirect"));

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);

    const profile = buildSignupProfile(values.email, values.fullName);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            role: "player",
          },
        },
      });

      if (error) {
        throw error;
      }

      clearDemoSession();
      const user = data.user ?? buildMockUser(values.email, profile.id);
      setUser(user);
      setProfile({ ...profile, id: user.id });
      setLoading(false);
      toast.success("Account created! Complete your profile to continue.");
      window.location.assign(postLoginPath);
    } catch (err) {
      if (isSupabaseConfigured()) {
        const message =
          err instanceof Error ? err.message : "Could not create account. Try again.";
        toast.error(message);
        return;
      }

      const res = await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "player" }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        toast.error("Could not create account. Try again.");
        return;
      }

      const user = buildMockUser(values.email, profile.id);
      persistDemoAuth(user, profile);
      setUser(user);
      setProfile({ ...profile, profileComplete: true });
      setLoading(false);
      toast.success("Account created! Welcome to PickleBuzz.");
      window.location.assign(postLoginPath);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-4", className)}>
      <p className="text-sm text-muted-foreground">
        Create your account. You&apos;ll add your photo and phone number next.
      </p>

      <div>
        <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium">
          Full name
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          className="input-base"
          placeholder="Your name"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-danger">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="signup-email"
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
        <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          className="input-base"
          placeholder="At least 8 characters"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-medium">
          Confirm password
        </label>
        <input
          id="signup-confirm"
          type="password"
          autoComplete="new-password"
          className="input-base"
          placeholder="Repeat password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-danger">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
