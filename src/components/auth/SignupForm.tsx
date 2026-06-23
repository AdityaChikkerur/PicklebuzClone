"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Chip } from "@/components/ui/Chip";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { useAuthStore } from "@/store/authStore";
import {
  SKILL_LEVELS,
  USER_ROLES,
  type SkillLevel,
  type UserRole,
} from "@/types/player";
import { cn } from "@/lib/utils";
import { clearDemoSession } from "@/lib/auth/demoSession";
import { persistDemoAuth } from "@/lib/auth/persistDemoAuth";
import { sanitizeRedirectPath } from "@/lib/auth/routeGuards";
import { buildMockUser, buildSignupProfile } from "./authHelpers";
import {
  signupStep1Schema,
  signupStep2Schema,
  type SignupStep1Values,
  type SignupStep2Values,
} from "./schemas";

const SIGNUP_CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
];

interface SignupFormProps {
  className?: string;
}

export function SignupForm({ className }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<SignupStep1Values | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const step1Form = useForm<SignupStep1Values>({
    resolver: zodResolver(signupStep1Schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const step2Form = useForm<SignupStep2Values>({
    resolver: zodResolver(signupStep2Schema),
    defaultValues: {
      role: "player",
      skillLevel: "3.5",
      city: "",
    },
    mode: "onChange",
  });

  const selectedRole = step2Form.watch("role");
  const selectedSkill = step2Form.watch("skillLevel");

  const handleStep1Continue = step1Form.handleSubmit((data) => {
    setStep1Data(data);
    setStep(2);
  });

  const postLoginPath = sanitizeRedirectPath(searchParams.get("redirect"));

  const completeSignup = async (step2: SignupStep2Values) => {
    if (!step1Data) return;

    setSubmitting(true);

    const profile = buildSignupProfile(
      step1Data.email,
      step1Data.fullName,
      step2.role as UserRole,
      step2.skillLevel as SkillLevel,
      step2.city
    );

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: {
            full_name: step1Data.fullName,
            role: step2.role,
            skill_level: step2.skillLevel,
            city: step2.city,
          },
        },
      });

      if (error) {
        throw error;
      }

      clearDemoSession();
      const user = data.user ?? buildMockUser(step1Data.email, profile.id);
      setUser(user);
      setProfile({ ...profile, id: user.id });
      setLoading(false);
      toast.success("Account created! Welcome to PickleBuzz.");
      window.location.assign(postLoginPath);
    } catch (err) {
      if (isSupabaseConfigured()) {
        const message =
          err instanceof Error ? err.message : "Could not create account. Try again.";
        toast.error(message);
        return;
      }

      const role = step2.role as UserRole;
      const res = await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "same-origin",
      });

      if (!res.ok) {
        toast.error("Could not create account. Try again.");
        return;
      }

      const user = buildMockUser(step1Data.email, profile.id);
      persistDemoAuth(user, profile);
      setUser(user);
      setProfile(profile);
      setLoading(false);
      toast.success("Account created! Welcome to PickleBuzz.");
      window.location.assign(postLoginPath);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2Submit = step2Form.handleSubmit((data) => {
    void completeSignup(data);
  });

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-center gap-3">
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back to credentials"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}
        <div className="flex flex-1 items-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex flex-1 flex-col gap-1">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  step >= s ? "bg-primary" : "bg-muted"
                )}
              />
              <span className="text-[10px] font-medium text-muted-foreground">
                {s === 1 ? "Account" : "Profile"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleStep1Continue} className="flex flex-col gap-4">
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
              {...step1Form.register("fullName")}
            />
            {step1Form.formState.errors.fullName && (
              <p className="mt-1 text-xs text-danger">
                {step1Form.formState.errors.fullName.message}
              </p>
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
              {...step1Form.register("email")}
            />
            {step1Form.formState.errors.email && (
              <p className="mt-1 text-xs text-danger">
                {step1Form.formState.errors.email.message}
              </p>
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
              {...step1Form.register("password")}
            />
            {step1Form.formState.errors.password && (
              <p className="mt-1 text-xs text-danger">
                {step1Form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="signup-confirm"
              className="mb-1.5 block text-sm font-medium"
            >
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              className="input-base"
              placeholder="Repeat password"
              {...step1Form.register("confirmPassword")}
            />
            {step1Form.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-danger">
                {step1Form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!step1Form.formState.isValid}
            className="btn-primary w-full"
          >
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={handleStep2Submit} className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-medium">I am a…</p>
            <div className="flex flex-wrap gap-2">
              {USER_ROLES.map((role) => (
                <Chip
                  key={role.value}
                  label={role.label}
                  active={selectedRole === role.value}
                  onClick={() =>
                    step2Form.setValue("role", role.value, {
                      shouldValidate: true,
                    })
                  }
                />
              ))}
            </div>
            {step2Form.formState.errors.role && (
              <p className="mt-1 text-xs text-danger">
                {step2Form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Skill level (DUPR)</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_LEVELS.map((level) => (
                <Chip
                  key={level}
                  label={level}
                  active={selectedSkill === level}
                  onClick={() =>
                    step2Form.setValue("skillLevel", level, {
                      shouldValidate: true,
                    })
                  }
                />
              ))}
            </div>
            {step2Form.formState.errors.skillLevel && (
              <p className="mt-1 text-xs text-danger">
                {step2Form.formState.errors.skillLevel.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="signup-city" className="mb-1.5 block text-sm font-medium">
              City
            </label>
            <input
              id="signup-city"
              type="text"
              list="signup-cities"
              className="input-base"
              placeholder="e.g. Bangalore"
              {...step2Form.register("city")}
            />
            <datalist id="signup-cities">
              {SIGNUP_CITIES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
            {step2Form.formState.errors.city && (
              <p className="mt-1 text-xs text-danger">
                {step2Form.formState.errors.city.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!step2Form.formState.isValid || submitting}
            className="btn-primary w-full"
          >
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
