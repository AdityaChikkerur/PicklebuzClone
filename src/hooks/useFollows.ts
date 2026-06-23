"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchFollowingIds,
  followPlayer,
  unfollowPlayer,
} from "@/lib/db/follows";

export function useFollows(userId: string | undefined) {
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setFollowing(new Set());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void fetchFollowingIds(userId).then((ids) => {
      if (!cancelled) {
        setFollowing(ids);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isFollowing = useCallback(
    (playerId: string) => following.has(playerId),
    [following]
  );

  const toggleFollow = useCallback(
    async (playerId: string, playerName: string) => {
      if (!userId) {
        toast.error("Sign in to follow players");
        return;
      }

      const wasFollowing = following.has(playerId);
      const ok = wasFollowing
        ? await unfollowPlayer(userId, playerId)
        : await followPlayer(userId, playerId);

      if (!ok) {
        toast.error("Could not update follow");
        return;
      }

      setFollowing((prev) => {
        const next = new Set(prev);
        if (wasFollowing) next.delete(playerId);
        else next.add(playerId);
        return next;
      });

      toast.success(
        wasFollowing
          ? `Unfollowed ${playerName}`
          : `Following ${playerName}`
      );
    },
    [userId, following]
  );

  return { following, loading, isFollowing, toggleFollow };
}
