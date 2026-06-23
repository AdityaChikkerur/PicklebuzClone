import type { ComponentType, SVGProps } from "react";

interface KpiCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  loading?: boolean;
  highlight?: boolean;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  loading,
  highlight,
}: KpiCardProps) {
  return (
    <div
      className={`card-base p-4 ${highlight ? "border-warning/40 bg-warning/5" : ""}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      {loading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-muted" />
      ) : (
        <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      )}
    </div>
  );
}
