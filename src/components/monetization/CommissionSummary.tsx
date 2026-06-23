import { PRICING, computeCommission } from "@/lib/monetization/pricing";
import { cn, formatCurrency } from "@/lib/utils";

interface CommissionSummaryProps {
  grossRevenue: number;
  className?: string;
}

export function CommissionSummary({
  grossRevenue,
  className,
}: CommissionSummaryProps) {
  const { commission, net } = computeCommission(grossRevenue);

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-sm",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Revenue breakdown (placeholder)
      </p>
      <dl className="mt-2 space-y-1">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Gross bookings</dt>
          <dd className="font-medium text-foreground">
            {formatCurrency(grossRevenue)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Platform commission ({PRICING.platformCommissionPct}%)
          </dt>
          <dd className="font-medium text-warning">
            −{formatCurrency(commission)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <dt className="font-semibold text-foreground">You receive</dt>
          <dd className="font-bold text-primary">{formatCurrency(net)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Court booking commission line — no payouts processed in Phase 2
      </p>
    </div>
  );
}
