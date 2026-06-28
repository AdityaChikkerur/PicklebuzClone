"use client";

import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { usePremium } from "@/hooks/usePremium";

interface PremiumUpsellCardProps {
  className?: string;
  compact?: boolean;
}

const PREMIUM_FEATURES = [
  "Advanced win/loss breakdowns",
  "Opponent scouting insights",
  "Exportable match history",
  "Priority discover placement",
];

export function PremiumUpsellCard({
  className,
  compact = false,
}: PremiumUpsellCardProps) {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const { isPremium, startFreeTrial, listPrice } = usePremium(userId);

  const handleUpgrade = () => {
    if (!userId) {
      toast.error("Sign in to upgrade");
      return;
    }
    void startFreeTrial();
  };

  return (
    <div
      className={cn(
        "card-base overflow-hidden border-secondary/20 bg-gradient-to-br from-secondary/5 to-primary/5",
        compact ? "p-4" : "p-5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
          <SparklesIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
            PickleBuzz Premium
          </p>
          <h3 className="mt-0.5 text-base font-bold text-foreground">
            {isPremium ? "Premium active" : "Unlock advanced analytics"}
          </h3>
          {!compact && (
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
          {!isPremium && (
            <div className="mt-2 flex flex-wrap items-baseline gap-2 text-sm">
              <span className="font-semibold text-muted-foreground line-through">
                {formatCurrency(listPrice)}
              </span>
              <span className="font-bold text-primary">First month FREE</span>
              <span className="font-normal text-muted-foreground">/ month after trial</span>
            </div>
          )}
          {isPremium && (
            <p className="mt-2 text-sm font-semibold text-primary">
              Your free trial is active. All premium features unlocked.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {!isPremium && (
              <button
                type="button"
                onClick={handleUpgrade}
                className="btn-primary text-sm"
              >
                Start free trial
              </button>
            )}
            <Link href="/stats" className="btn-outline text-sm">
              {isPremium ? "View stats" : "Preview stats"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
