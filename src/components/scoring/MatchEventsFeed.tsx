import { formatRelativeTime } from "@/lib/utils";
import type { MatchEvent } from "@/types/match";

interface MatchEventsFeedProps {
  events: MatchEvent[];
}

const EVENT_ICONS: Record<MatchEvent["eventType"], string> = {
  point: "●",
  fault: "⚠",
  side_out: "↔",
  timeout: "⏱",
  game_win: "🏆",
  match_win: "🎉",
};

export function MatchEventsFeed({ events }: MatchEventsFeedProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-slate-700/80 px-4 py-3">
      <p className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Match events
      </p>

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <li className="py-4 text-center text-sm text-slate-500">
            No events yet — tap +1 to score.
          </li>
        ) : (
          events.map((event) => (
            <li
              key={event.id}
              className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2"
            >
              <span className="shrink-0 text-sm" aria-hidden="true">
                {EVENT_ICONS[event.eventType]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200">{event.description}</p>
                <p className="text-xs text-slate-500">
                  G{event.gameNumber} · {event.scoreA}–{event.scoreB} ·{" "}
                  {formatRelativeTime(event.createdAt)}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
