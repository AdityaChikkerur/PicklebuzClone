"use client";

import Link from "next/link";
import { AppLayout } from "@/components/layout";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ProfileBoostCard } from "@/components/monetization";
import { DuprSyncCard } from "@/components/profile/DuprSyncCard";
import { useAuthStore } from "@/store/authStore";
import { useProfileBoost } from "@/hooks/useProfileBoost";
import { formatDupr } from "@/lib/utils";
import { USER_ROLES } from "@/types/player";

export function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const { boosted } = useProfileBoost(userId);

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

  return (
    <AppLayout title="Profile">
      <div className="mx-auto flex max-w-lg flex-col gap-5">
        <div className="card-base flex flex-col items-center gap-4 p-6 text-center">
          <Avatar
            src={profile.avatarUrl}
            name={profile.fullName}
            size="xl"
            ring
          />
          <div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <h2 className="text-xl font-bold text-foreground">
                {profile.fullName}
              </h2>
              {boosted && <Badge variant="warning">Boosted</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{profile.city}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="primary">{profile.skillLevel}</Badge>
            <Badge variant="outline">{roleLabel}</Badge>
            <Badge variant="secondary">DUPR {formatDupr(profile.duprRating)}</Badge>
          </div>
        </div>

        <DuprSyncCard
          duprRating={profile.duprRating}
          duprId={profile.duprId}
          syncedAt={profile.duprSyncedAt}
          onSynced={(rating) =>
            setProfile({ ...profile, duprRating: rating })
          }
        />

        <ProfileBoostCard />

        <Link href="/dashboard" className="btn-outline text-center text-sm">
          Back to dashboard
        </Link>
      </div>
    </AppLayout>
  );
}
