import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, gamesToWin } from "@/lib/utils";
import {
  CATEGORY_TYPE_LABELS,
  type TournamentForm,
} from "@/types/tournament";

interface ReviewStepProps {
  form: TournamentForm;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ReviewStep({ form }: ReviewStepProps) {
  const scoringLabel = form.scoringType === "rally" ? "Rally" : "Side-out";
  const bestOfLabel =
    form.bestOf === 1 ? "Single game" : `Best of ${form.bestOf} (${gamesToWin(form.bestOf)} to win)`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Review & publish</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm everything looks right before publishing.
        </p>
      </div>

      <div className="card-base overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-foreground">{form.name || "Untitled tournament"}</h3>
            <Badge variant={form.isPublic ? "primary" : "outline"}>
              {form.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          {form.description && (
            <p className="mt-1 text-sm text-muted-foreground">{form.description}</p>
          )}
        </div>

        <div className="divide-y divide-border px-4">
          <div className="py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Venue & schedule
            </p>
            <div className="flex flex-col gap-1.5 text-sm text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {form.venue}, {form.city}
              </span>
              {form.address && (
                <span className="pl-5 text-muted-foreground">{form.address}</span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {formatDate(form.startDate)} – {formatDate(form.endDate)}
              </span>
              <span className="pl-5 text-muted-foreground">
                Register by {formatDate(form.registrationDeadline)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UsersIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                Up to {form.maxParticipants} participants
              </span>
            </div>
          </div>

          <div className="py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Categories ({form.categories.length})
            </p>
            <ul className="flex flex-col gap-2">
              {form.categories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {CATEGORY_TYPE_LABELS[category.categoryType]}{" "}
                    <Badge variant="secondary" className="ml-1">
                      {category.skillLevel}
                    </Badge>
                  </span>
                  <span className="text-muted-foreground">
                    {category.maxTeams} teams · {formatCurrency(category.entryFee)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Match rules
            </p>
            <SummaryRow label="Scoring" value={scoringLabel} />
            <SummaryRow label="Points per game" value={String(form.pointsToWin)} />
            <SummaryRow label="Format" value={bestOfLabel} />
            <SummaryRow label="Win margin" value={`Win by ${form.winBy}`} />
            <SummaryRow
              label="Timeouts"
              value={`${form.maxTimeouts} per team · ${form.timeoutDuration}s`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
