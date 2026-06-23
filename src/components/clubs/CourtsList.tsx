import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Court } from "@/types/club";

interface CourtsListProps {
  courts: Court[];
  selectedCourtId?: string;
  onSelect?: (court: Court) => void;
  selectable?: boolean;
}

export function CourtsList({
  courts,
  selectedCourtId,
  onSelect,
  selectable = false,
}: CourtsListProps) {
  if (courts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No courts listed yet.</p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {courts.map((court) => {
        const selected = court.id === selectedCourtId;
        const Wrapper = selectable ? "button" : "div";

        return (
          <li key={court.id}>
            <Wrapper
              type={selectable ? "button" : undefined}
              onClick={selectable ? () => onSelect?.(court) : undefined}
              className={
                selectable
                  ? `card-base w-full p-4 text-left transition-all ${
                      selected
                        ? "border-primary ring-2 ring-primary/20"
                        : "hover:border-primary/30"
                    }`
                  : "card-base p-4"
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{court.name}</p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                    {court.surface} surface
                  </p>
                </div>
                <Badge variant="outline">
                  {formatCurrency(court.pricePerHour)}/hr
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Open {court.openFrom} – {court.openTo}
              </p>
            </Wrapper>
          </li>
        );
      })}
    </ul>
  );
}
