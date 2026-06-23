import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { CourtBookingWithDetails } from "@/types/club";

interface OwnerBookingsTableProps {
  bookings: CourtBookingWithDetails[];
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}

const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "success",
  cancelled: "outline",
} as const;

export function OwnerBookingsTable({
  bookings,
  onConfirm,
  onCancel,
  showActions = true,
}: OwnerBookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="card-base px-6 py-10 text-center text-sm text-muted-foreground">
        No bookings scheduled.
      </div>
    );
  }

  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Court</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              {showActions && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">
                  {b.courtName}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(b.startAt)}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatCurrency(b.amount)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[b.status]}>{b.status}</Badge>
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {b.status === "pending" && onConfirm && (
                        <button
                          type="button"
                          onClick={() => onConfirm(b.id)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status !== "cancelled" && onCancel && (
                        <button
                          type="button"
                          onClick={() => onCancel(b.id)}
                          className="text-xs font-semibold text-danger hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
