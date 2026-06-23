import { Badge } from "@/components/ui/Badge";
import type { AppDataSource } from "@/lib/db/dataSource";

interface DataSourceBadgeProps {
  source: AppDataSource | "supabase" | "mock" | "local";
  className?: string;
}

/** Shown on pages backed by demo data so configured-but-empty DB is visible. */
export function DataSourceBadge({ source, className }: DataSourceBadgeProps) {
  if (source === "supabase") return null;

  const label =
    source === "local" ? "Local demo storage" : "Demo data";

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
