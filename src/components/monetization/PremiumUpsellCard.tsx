"use client";

import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { PRICING } from "@/lib/monetization/pricing";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { usePayments } from "@/hooks/usePayments";

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
  const { recordPayment } = usePayments(userId);

  const handleUpgrade = () => {
    if (!userId) {
      toast.error("Sign in to upgrade");
      return;
    }
    void recordPayment({
      kind: "subscription",
      amount: PRICING.premiumMonthly,
      status: "pending",
      successMessage: `Premium plan noted at ${formatCurrency(PRICING.premiumMonthly)}/mo (placeholder — no charge)`,
    });
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
            Unlock advanced analytics
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
          <p className="mt-2 text-sm font-semibold text-foreground">
            {formatCurrency(PRICING.premiumMonthly)}
            <span className="font-normal text-muted-foreground"> / month</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleUpgrade}
              className="btn-primary text-sm"
            >
              Upgrade (placeholder)
            </button>
            <Link href="/stats" className="btn-outline text-sm">
              Preview stats
            </Link>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            No real payment — records a pending row in payments_placeholder
          </p>
        </div>
      </div>
    </div>
  );
}
