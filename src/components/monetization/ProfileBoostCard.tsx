"use client";

import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { PRICING } from "@/lib/monetization/pricing";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useProfileBoost } from "@/hooks/useProfileBoost";

interface ProfileBoostCardProps {
  className?: string;
}

export function ProfileBoostCard({ className }: ProfileBoostCardProps) {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const profile = useAuthStore((s) => s.profile);
  const { boosted, loading, purchaseBoost } = useProfileBoost(userId);

  return (
    <div className={cn("card-base p-5", className)}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
          <RocketLaunchIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              Boost your profile
            </h3>
            {boosted && <Badge variant="warning">Boosted</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Appear higher in Discover and partner searches for 7 days.
          </p>
          {!boosted && (
            <div className="mt-2 flex flex-wrap items-baseline gap-2 text-sm">
              <span className="font-semibold text-muted-foreground line-through">
                {formatCurrency(PRICING.profileBoost)}
              </span>
              <span className="font-bold text-primary">First month FREE</span>
              <span className="font-normal text-muted-foreground">· one-time after trial</span>
            </div>
          )}
          {profile && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {profile.fullName} · {profile.city}
            </p>
          )}
          <button
            type="button"
            disabled={loading || boosted}
            onClick={() => void purchaseBoost()}
            className="btn-primary mt-4 text-sm"
          >
            {boosted ? "Profile boosted" : "Boost profile free"}
          </button>
        </div>
      </div>
    </div>
  );
}
