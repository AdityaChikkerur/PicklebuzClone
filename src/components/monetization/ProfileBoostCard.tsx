"use client";

import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { PRICING } from "@/lib/monetization/pricing";
import { PAID_BOOST_DAYS } from "@/lib/monetization/profileBoost";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  getBoostStatusLabel,
  useProfileBoost,
} from "@/hooks/useProfileBoost";

interface ProfileBoostCardProps {
  className?: string;
}

export function ProfileBoostCard({ className }: ProfileBoostCardProps) {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const profile = useAuthStore((s) => s.profile);
  const { boostStatus, loading, purchaseBoost } = useProfileBoost(userId);

  const statusLabel = getBoostStatusLabel(boostStatus);
  const canPurchase =
    !boostStatus.active ||
    boostStatus.status === "expired" ||
    boostStatus.status === "free";

  return (
    <div className={cn("card-base p-5", className)}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
          <RocketLaunchIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              Profile Boost
            </h3>
            {boostStatus.active && (
              <Badge variant="warning">{statusLabel}</Badge>
            )}
            {boostStatus.status === "expired" && (
              <Badge variant="outline">{statusLabel}</Badge>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Appear at the top of Discover while your boost is active. Boosted
            profiles are shuffled among other boosted players — no other stats
            are affected.
          </p>

          {boostStatus.active && (
            <p className="mt-2 text-sm font-medium text-foreground">
              {boostStatus.daysRemaining}{" "}
              {boostStatus.daysRemaining === 1 ? "day" : "days"} remaining
            </p>
          )}

          {boostStatus.status === "expired" && (
            <p className="mt-2 text-sm text-muted-foreground">
              Your boost has expired. Purchase a 1-month boost to appear at the
              top of Discover again.
            </p>
          )}

          {boostStatus.status === "none" && (
            <p className="mt-2 text-sm text-muted-foreground">
              New players receive a free 15-day boost when they sign up.
            </p>
          )}

          {canPurchase && (
            <div className="mt-2 flex flex-wrap items-baseline gap-2 text-sm">
              <span className="font-bold text-foreground">
                1 Month Profile Boost
              </span>
              <span className="font-semibold text-primary">
                {formatCurrency(PRICING.profileBoost)}
              </span>
              <span className="text-muted-foreground">
                · {PAID_BOOST_DAYS} days
              </span>
            </div>
          )}

          {profile && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {profile.fullName} · {profile.city}
            </p>
          )}

          {canPurchase && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void purchaseBoost()}
              className="btn-primary mt-4 text-sm"
            >
              {boostStatus.status === "free"
                ? "Upgrade to 1-month boost"
                : "Buy 1-month boost"}
            </button>
          )}

          {boostStatus.status === "paid" && boostStatus.active && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void purchaseBoost()}
              className="btn-outline mt-4 text-sm"
            >
              Extend boost (+{PAID_BOOST_DAYS} days)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
