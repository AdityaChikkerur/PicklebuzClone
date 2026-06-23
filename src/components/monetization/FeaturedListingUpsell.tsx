"use client";

import { StarIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { PRICING } from "@/lib/monetization/pricing";
import { cn, formatCurrency } from "@/lib/utils";

interface FeaturedListingUpsellProps {
  tournamentId: string;
  tournamentName: string;
  featured: boolean;
  onToggle: () => void;
  className?: string;
}

export function FeaturedListingUpsell({
  tournamentId,
  tournamentName,
  featured,
  onToggle,
  className,
}: FeaturedListingUpsellProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <StarIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Featured homepage listing
          </p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(PRICING.featuredTournament)} one-time · placeholder
          </p>
        </div>
        {featured && <Badge variant="secondary">Featured</Badge>}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={featured ? "btn-outline text-xs" : "btn-primary text-xs"}
        aria-pressed={featured}
        aria-label={
          featured
            ? `Remove ${tournamentName} from featured listings`
            : `List ${tournamentName} as featured`
        }
      >
        {featured ? "Remove featured" : "List as featured"}
      </button>
      <span className="sr-only" id={`featured-${tournamentId}`}>
        Tournament {tournamentName}
      </span>
    </div>
  );
}
