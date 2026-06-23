import Link from "next/link";
import { MapPinIcon, SignalIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import type { LandingLiveMatch } from "@/lib/mock/landingMockData";

interface LiveNowStripProps {
  matches: LandingLiveMatch[];
}

export function LiveNowStrip({ matches }: LiveNowStripProps) {
  if (matches.length === 0) return null;

  return (
    <section id="live-now" className="scroll-mt-20">
      <div className="mb-3 flex items-center gap-2">
        <SignalIcon className="h-5 w-5 text-danger" aria-hidden="true" />
        <h2 className="text-lg font-bold text-foreground">Live now</h2>
        <Badge variant="live" dot>
          {matches.length}
        </Badge>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-thin sm:-mx-6 sm:px-6">
        {matches.map((match) => (
          <Link
            key={match.id}
            href={`/spectate/${match.id}`}
            className="card-base min-w-[260px] shrink-0 p-4 transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-[280px]"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <Badge variant="live" dot>
                LIVE
              </Badge>
              <span className="text-xs capitalize text-muted-foreground">
                Game {match.gameNumber} · {match.matchType}
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">
                {match.teamAName}
              </p>
              <span className="text-2xl font-extrabold tabular-nums text-foreground">
                {match.scoreA}
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">
                {match.teamBName}
              </p>
              <span className="text-2xl font-extrabold tabular-nums text-foreground">
                {match.scoreB}
              </span>
            </div>

            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {match.venue}, {match.city}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
