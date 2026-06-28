import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { LeaderboardPlayer, RankingCategory } from "./types";
import { formatPrimaryStat } from "./utils";

interface PodiumProps {
  players: LeaderboardPlayer[];
  category: RankingCategory;
}

const PODIUM_ORDER = [1, 0, 2] as const;

const podiumStyles = [
  {
    place: 2,
    height: "h-24 sm:h-28",
    medal: "bg-muted text-muted-foreground border border-border",
    ring: "ring-muted-foreground/30",
    label: "2nd",
  },
  {
    place: 1,
    height: "h-32 sm:h-36",
    medal: "gradient-neon text-primary-foreground glow-neon-sm",
    ring: "ring-primary",
    label: "1st",
  },
  {
    place: 3,
    height: "h-20 sm:h-24",
    medal: "bg-amber-light text-amber-brand border border-amber-brand/20",
    ring: "ring-amber-brand/50",
    label: "3rd",
  },
];

export function Podium({ players, category }: PodiumProps) {
  const topThree = players.slice(0, 3);
  if (topThree.length < 3) return null;

  return (
    <div className="card-glow p-4 sm:p-6">
      <div className="relative z-10 mb-4 text-center">
        <h2 className="font-display text-sm font-black italic text-foreground">Top 3</h2>
        <p className="text-xs text-muted-foreground">City leaderboard podium</p>
      </div>

      <div className="flex items-end justify-center gap-3 sm:gap-5">
        {PODIUM_ORDER.map((index, slot) => {
          const player = topThree[index];
          const style = podiumStyles[slot];

          return (
            <div
              key={player.id}
              className="flex w-[30%] max-w-[7.5rem] flex-col items-center gap-2 sm:max-w-[8.5rem]"
            >
              <div className="flex flex-col items-center gap-1.5">
                <Avatar
                  src={player.avatarUrl}
                  name={player.fullName}
                  size={index === 0 ? "lg" : "md"}
                  ring
                  className={cn("ring-offset-2", style.ring)}
                />
                <div className="text-center">
                  <p className="line-clamp-2 text-xs font-bold text-foreground sm:text-sm">
                    {player.fullName}
                  </p>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">
                    {player.city}
                  </p>
                </div>
                <Badge variant="outline">{player.skillLevel}</Badge>
                <p className="text-sm font-bold tabular-nums text-primary sm:text-base">
                  {formatPrimaryStat(player, category)}
                </p>
              </div>

              <div
                className={cn(
                  "flex w-full flex-col items-center justify-end rounded-t-xl px-2 pb-2 pt-3",
                  style.height,
                  style.medal
                )}
              >
                <span className="text-lg font-extrabold">{style.place}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                  {style.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
