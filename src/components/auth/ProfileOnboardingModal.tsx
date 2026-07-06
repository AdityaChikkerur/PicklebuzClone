"use client";

import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon } from "@heroicons/react/24/outline";
import { z } from "zod";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const SIGNUP_CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
];
import { isPhoneDuplicateError } from "@/lib/db/formatDbError";
import { completePlayerProfile } from "@/lib/db/profiles";
import { getDefaultHomeForRole } from "@/lib/auth/routeGuards";
import { useAuthStore } from "@/store/authStore";
import { ONBOARDING_ROLES, type UserRole } from "@/types/player";
import { onboardingSchema, type OnboardingFormValues } from "./schemas";

export function ProfileOnboardingModal() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      phone: profile?.phone ?? "",
      city: profile?.city ?? "",
      role:
        profile?.role && profile.role !== "admin"
          ? profile.role
          : "player",
    },
    mode: "onChange",
  });

  const selectedRole = watch("role");

  const onPickPhoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onPhotoChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please choose an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be 5 MB or smaller");
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    },
    []
  );

  const onSubmit = handleSubmit(async (values) => {
    if (!user?.id) {
      toast.error("Session expired. Please sign in again.");
      return;
    }

    if (!avatarFile) {
      toast.error("Profile photo is required");
      return;
    }

    setSubmitting(true);

    const result = await completePlayerProfile({
      userId: user.id,
      phone: values.phone.replace(/\s|-/g, ""),
      city: values.city,
      role: values.role as UserRole,
      avatarFile,
      fullName: profile?.fullName,
    });

    setSubmitting(false);

    if (result.error || !result.data) {
      const message = result.error ?? "Could not save profile";
      if (isPhoneDuplicateError(message)) {
        setError("phone", { type: "server", message });
        return;
      }
      toast.error(message);
      return;
    }

    setProfile(result.data);
    toast.success("Profile complete. Welcome to PickleBuzz!");
    window.location.assign(getDefaultHomeForRole(values.role as UserRole));
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="card-base w-full max-w-md overflow-hidden shadow-2xl sm:rounded-2xl">
        <div className="border-b border-border bg-muted/30 px-6 py-5 text-center">
          <h2 id="onboarding-title" className="text-lg font-bold text-foreground">
            Complete your profile
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Required before you can play, score, and rank on PickleBuzz.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5 px-6 py-6">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onPickPhoto}
              className={cn(
                "group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                !avatarPreview && "ring-2 ring-dashed ring-primary/40 ring-offset-2 ring-offset-background"
              )}
              aria-label="Upload profile photo"
            >
              {avatarPreview ? (
                <Avatar src={avatarPreview} name={profile?.fullName ?? "You"} size="xl" ring />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <CameraIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md">
                <CameraIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
            <p className="text-xs font-medium text-muted-foreground">
              Profile photo <span className="text-danger">*</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={onPhotoChange}
            />
          </div>

          <div>
            <label htmlFor="onboarding-phone" className="mb-1.5 block text-sm font-medium">
              Phone number <span className="text-danger">*</span>
            </label>
            <input
              id="onboarding-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={errors.phone ? true : undefined}
              className={cn(errors.phone ? "input-error" : "input-base")}
              placeholder="+91 98765 43210"
              {...register("phone", {
                onChange: () => clearErrors("phone"),
              })}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs font-medium text-danger" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="onboarding-city" className="mb-1.5 block text-sm font-medium">
              City <span className="text-danger">*</span>
            </label>
            <input
              id="onboarding-city"
              type="text"
              list="onboarding-cities"
              className="input-base"
              placeholder="e.g. Bengaluru"
              {...register("city")}
            />
            <datalist id="onboarding-cities">
              {SIGNUP_CITIES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
            {errors.city && (
              <p className="mt-1 text-xs text-danger">{errors.city.message}</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">I am a…</p>
            <div className="flex flex-col gap-2">
              {ONBOARDING_ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() =>
                    setValue("role", role.value as OnboardingFormValues["role"], {
                      shouldValidate: true,
                    })
                  }
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    selectedRole === role.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <span className="block text-sm font-semibold text-foreground">
                    {role.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {role.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "Saving…" : "Continue to PickleBuzz"}
          </button>
        </form>
      </div>
    </div>
  );
}
