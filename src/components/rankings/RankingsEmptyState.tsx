import { ChartBarIcon } from "@heroicons/react/24/outline";

interface RankingsEmptyStateProps {
  onClearFilters: () => void;
}

export function RankingsEmptyState({ onClearFilters }: RankingsEmptyStateProps) {
  return (
    <div className="card-base flex flex-col items-center gap-4 px-6 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
        <svg
          viewBox="0 0 80 80"
          className="h-14 w-14 text-muted-foreground"
          aria-hidden="true"
        >
          <rect x="12" y="48" width="12" height="20" rx="2" fill="currentColor" opacity="0.35" />
          <rect x="34" y="32" width="12" height="36" rx="2" fill="currentColor" opacity="0.55" />
          <rect x="56" y="40" width="12" height="28" rx="2" fill="currentColor" opacity="0.45" />
          <circle cx="18" cy="38" r="8" fill="currentColor" opacity="0.25" />
          <circle cx="40" cy="22" r="8" fill="currentColor" opacity="0.4" />
          <circle cx="62" cy="30" r="8" fill="currentColor" opacity="0.3" />
        </svg>
      </div>

      <div className="flex flex-col items-center gap-1">
        <ChartBarIcon className="h-6 w-6 text-primary" aria-hidden="true" />
        <h3 className="text-lg font-bold text-foreground">No players found</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try adjusting your search or filters to find players on the leaderboard.
        </p>
      </div>

      <button type="button" onClick={onClearFilters} className="btn-outline">
        Clear all filters
      </button>
    </div>
  );
}
