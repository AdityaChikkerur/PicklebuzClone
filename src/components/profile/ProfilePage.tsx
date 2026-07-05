"use client";

import Link from "next/link";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { AppLayout } from "@/components/layout";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ProfileBoostCard } from "@/components/monetization";
import { AccountSection } from "@/components/profile/AccountSection";
import { EditNameSection } from "@/components/profile/EditNameSection";
import { useAuthStore } from "@/store/authStore";
import { useProfileBoost } from "@/hooks/useProfileBoost";
import { formatDupr } from "@/lib/utils";
import { USER_ROLES } from "@/types/player";

export function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
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
  const rating = profile.playerRating ?? profile.duprRating;

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
            {profile.phone ? (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                {profile.phone}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="primary">Rating {formatDupr(rating)}</Badge>
            <Badge variant="outline">{roleLabel}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Rating updates automatically after verified matches.
          </p>
        </div>

        <ProfileBoostCard />

        <EditNameSection />

        <AccountSection />

        <Link href="/dashboard" className="btn-outline text-center text-sm">
          Back to dashboard
        </Link>
      </div>
    </AppLayout>
  );
}
