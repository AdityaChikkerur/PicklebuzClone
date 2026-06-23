import {
  MapPinIcon,
  PhoneIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { formatAmenity } from "@/lib/clubs/bookingUtils";
import type { Club } from "@/types/club";

interface ClubHeaderProps {
  club: Club;
}

export function ClubHeader({ club }: ClubHeaderProps) {
  return (
    <div className="card-base overflow-hidden">
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 px-5 py-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="primary" className="mb-2">
              {club.city}
            </Badge>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {club.name}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="h-4 w-4 shrink-0 text-primary" />
              {club.location}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-2 shadow-sm">
            <StarIcon className="h-5 w-5 text-warning" aria-hidden="true" />
            <span className="text-lg font-bold text-foreground">
              {club.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {club.amenities.map((a) => (
            <Chip key={a} label={formatAmenity(a)} />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {club.courtCount ?? "—"} courts available
          </span>
          {club.contact && (
            <a
              href={`tel:${club.contact.replace(/\s/g, "")}`}
              className="flex items-center gap-1 hover:text-primary"
            >
              <PhoneIcon className="h-4 w-4" aria-hidden="true" />
              {club.contact}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
