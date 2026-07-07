"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  CameraIcon,
  PencilSquareIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ProfileBoostCard } from "@/components/monetization";
import { AccountSection } from "@/components/profile/AccountSection";
import { useAuthStore } from "@/store/authStore";
import { useProfileBoost, getBoostStatusLabel } from "@/hooks/useProfileBoost";
import { formatBuzzRating } from "@/lib/utils";
import { USER_ROLES } from "@/types/player";
import { createClient } from "@/lib/supabase";
import { updateProfileAvatar, updateProfileFullName } from "@/lib/db/profiles";
import {
  fetchFollowerCount,
  fetchFollowingCount,
  FOLLOWS_UPDATED_EVENT,
} from "@/lib/db/follows";

export function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const setProfile = useAuthStore((s) => s.setProfile);

  const { boostStatus } = useProfileBoost(userId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [matchesPlayed, setMatchesPlayed] = useState(0);

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(profile?.fullName ?? "");
  const [savingName, setSavingName] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    setName(profile?.fullName ?? "");
  }, [profile?.fullName]);

  useEffect(() => {
    if (!userId) return;

    const currentUserId = userId;

    async function loadCounts() {
      const supabase = createClient();

      const [followersCount, followingCount, matchesResult] = await Promise.all([
        fetchFollowerCount(currentUserId),
        fetchFollowingCount(currentUserId),
        supabase
          .from("match_players")
          .select("*", { count: "exact", head: true })
          .eq("player_id", currentUserId),
      ]);

      setFollowers(followersCount);
      setFollowing(followingCount);
      setMatchesPlayed(matchesResult.count ?? 0);
    }

    void loadCounts();

    const onFollowsUpdated = () => {
      void loadCounts();
    };

    window.addEventListener(FOLLOWS_UPDATED_EVENT, onFollowsUpdated);

    return () => {
      window.removeEventListener(FOLLOWS_UPDATED_EVENT, onFollowsUpdated);
    };
  }, [userId]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!userId) return;

    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    setSavingAvatar(true);
    const result = await updateProfileAvatar(userId, file);
    setSavingAvatar(false);

    if (result.error || !result.data) {
      toast.error(result.error ?? "Could not update profile photo");
      return;
    }

    setProfile(result.data);
    toast.success("Profile photo updated");
  };

  const saveName = async () => {
    if (!userId || !profile) return;

    const trimmed = name.trim();

    if (trimmed.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    if (trimmed === profile.fullName) {
      setEditingName(false);
      return;
    }

    setSavingName(true);
    const result = await updateProfileFullName(userId, trimmed);
    setSavingName(false);

    if (result.error || !result.data) {
      toast.error(result.error ?? "Could not update name");
      return;
    }

    setProfile(result.data);
    setEditingName(false);
    toast.success("Name updated");
  };

  if (loading) {
    return (
      <AppLayout title="Profile">
        <div className="flex justify-center py-16">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label="Loading profile"
          />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout title="Profile">
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to view your profile.{" "}
            <Link href="/auth" className="text-primary underline">
              Sign in
            </Link>
          </p>
        </div>
      </AppLayout>
    );
  }

  const roleLabel =
    USER_ROLES.find((r) => r.value === profile.role)?.label ?? profile.role;

  const rating = profile.playerRating ?? profile.duprRating;

  return (
    <AppLayout title="Profile">
      <div className="mx-auto flex max-w-lg flex-col gap-5">
        <div className="card-base flex flex-col items-center gap-4 p-6 text-center">
          <div className="relative">
            <Avatar
              src={profile.avatarUrl}
              name={profile.fullName}
              size="xl"
              ring
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={savingAvatar}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-black shadow-lg transition hover:scale-105 disabled:opacity-60"
              aria-label="Change profile photo"
            >
              {savingAvatar ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <CameraIcon className="h-4 w-4" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="w-full">
            {editingName ? (
              <div className="mx-auto flex max-w-xs flex-col gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  className="input-base text-center"
                  disabled={savingName}
                  autoFocus
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void saveName()}
                    disabled={savingName || name.trim().length < 2}
                    className="btn-primary flex-1 text-sm"
                  >
                    {savingName ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setName(profile.fullName);
                      setEditingName(false);
                    }}
                    disabled={savingName}
                    className="btn-outline flex-1 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {profile.fullName}
                </h2>

                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="rounded-full p-1 text-primary transition hover:bg-primary/10"
                  aria-label="Edit display name"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {boostStatus.active && (
                <Badge variant="warning">{getBoostStatusLabel(boostStatus)}</Badge>
              )}

              {boostStatus.status === "expired" && (
                <Badge variant="outline">Boost Expired</Badge>
              )}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">{profile.city}</p>

            {profile.phone ? (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                {profile.phone}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="primary">BUZZ {formatBuzzRating(rating)}</Badge>
            <Badge variant="outline">{roleLabel}</Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            Rating updates automatically after verified matches.
          </p>

          <div className="mt-5 grid w-full grid-cols-3 divide-x rounded-xl border border-border">
            <div className="py-3 text-center">
              <p className="text-xl font-bold">{matchesPlayed}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>

            <Link
              href="/profile/followers"
              className="py-3 text-center transition hover:bg-muted/50"
            >
              <p className="text-xl font-bold">{followers}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </Link>

            <Link
              href="/profile/following"
              className="py-3 text-center transition hover:bg-muted/50"
            >
              <p className="text-xl font-bold">{following}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </Link>
          </div>
        </div>

        <ProfileBoostCard />

        <AccountSection />

        <Link href="/dashboard" className="btn-outline text-center text-sm">
          Back to dashboard
        </Link>
      </div>
    </AppLayout>
  );
}