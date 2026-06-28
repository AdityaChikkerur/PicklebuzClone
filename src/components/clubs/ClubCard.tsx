import Link from "next/link";
import {
  MapPinIcon,
  PhoneIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { formatAmenity } from "@/lib/clubs/bookingUtils";
import { cn } from "@/lib/utils";
import type { Club } from "@/types/club";

interface ClubCardProps {
  club: Club;
  className?: string;
}

export function ClubCard({ club, className }: ClubCardProps) {
  return (
    <Link
      href={`/club/${club.id}`}
      className={cn(
        "card-base group flex min-h-[180px] flex-col gap-3 p-4 transition-all hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">
            {club.name}
          </h3>
          <p className="mt-1 flex items-start gap-1 text-sm text-muted-foreground">
            <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-2 break-words">
              {club.location}, {club.city}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-warning/10 px-2 py-1 text-sm font-semibold text-warning">
          <StarIcon className="h-4 w-4" aria-hidden="true" />
          {club.rating.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {club.amenities.slice(0, 4).map((a) => (
          <Chip key={a} label={formatAmenity(a)} />
        ))}
        {club.amenities.length > 4 && (
          <span className="text-xs text-muted-foreground">
            +{club.amenities.length - 4} more
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
        <Badge variant="primary">
          {club.courtCount ?? "-"} courts
        </Badge>
        {club.contact && (
          <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
            <PhoneIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{club.contact}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
