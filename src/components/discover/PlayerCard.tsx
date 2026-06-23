"use client";

import {
  FireIcon,
  MapPinIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useFollows } from "@/hooks/useFollows";
import { useAuthStore } from "@/store/authStore";
import { cn, formatDupr } from "@/lib/utils";
import type { Player } from "@/types/player";

interface PlayerCardProps {
  player: Player;
  className?: string;
}

export function PlayerCard({ player, className }: PlayerCardProps) {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const { isFollowing, toggleFollow } = useFollows(userId);
  const following = isFollowing(player.id);

  const handleInvite = () => {
    toast.success(`Invite sent to ${player.fullName}`, {
      description: "They'll be notified when match invites are wired up.",
    });
  };

  return (
    <article
      className={cn(
        "card-base flex flex-col gap-3 p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar
          src={player.avatarUrl}
          name={player.fullName}
          size="md"
          ring
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-foreground">
            {player.fullName}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {player.city}
          </p>
        </div>
        <Badge variant="primary">{player.skillLevel}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-foreground">
          DUPR {formatDupr(player.duprRating)}
        </span>
        {player.winPct != null && player.wins != null && (
          <span className="text-muted-foreground">
            · {player.winPct}% ({player.wins}W
            {player.losses != null ? `-${player.losses}L` : ""})
          </span>
        )}
        {(player.currentStreak ?? 0) > 0 && (
          <Badge variant="warning" className="gap-1">
            <FireIcon className="h-3 w-3" aria-hidden="true" />
            {player.currentStreak} streak
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {player.lookingForPartner && (
          <Badge variant="secondary">
            <UserGroupIcon className="h-3 w-3" aria-hidden="true" />
            Partner
          </Badge>
        )}
        {player.lookingForMatch && (
          <Badge variant="outline">Open match</Badge>
        )}
      </div>

      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={() => void toggleFollow(player.id, player.fullName)}
          className={cn(
            "btn-outline flex-1 text-sm",
            following && "border-primary text-primary"
          )}
        >
          <UserPlusIcon className="mr-1 inline h-4 w-4" aria-hidden="true" />
          {following ? "Following" : "Follow"}
        </button>
        <button
          type="button"
          onClick={handleInvite}
          className="btn-primary flex-1 text-sm"
        >
          Invite
        </button>
      </div>
    </article>
  );
}
