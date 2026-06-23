"use client";

import { CreditCardIcon } from "@heroicons/react/24/outline";
import { cn, formatCurrency } from "@/lib/utils";
import { isRazorpayEnabled } from "@/lib/payments/isRazorpayEnabled";

interface PaymentPanelProps {
  amount: number;
  label?: string;
  description?: string;
  className?: string;
}

export function PaymentPanel({
  amount,
  label = "Payment",
  description,
  className,
}: PaymentPanelProps) {
  const gatewayLive = isRazorpayEnabled();

  const defaultDescription = gatewayLive
    ? "Pay securely via Razorpay. Your entry fee is charged in INR."
    : "Tap the action button to submit without charging. A pending payment row is recorded for future gateway wiring.";

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-muted/20 p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <CreditCardIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-sm font-bold text-primary">
              {formatCurrency(amount)}
            </p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {description ?? defaultDescription}
          </p>
          <p
            className={cn(
              "mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              gatewayLive
                ? "bg-primary/10 text-primary"
                : "bg-warning/10 text-warning"
            )}
          >
            {gatewayLive ? "Razorpay checkout" : "Placeholder — no real charge"}
          </p>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use PaymentPanel */
export const PaymentPlaceholderPanel = PaymentPanel;
