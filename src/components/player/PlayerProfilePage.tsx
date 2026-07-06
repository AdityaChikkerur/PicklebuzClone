"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase";
import { formatDupr } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useFollows } from "@/hooks/useFollows";
import {
  fetchFollowerCount,
  fetchFollowingCount,
} from "@/lib/db/follows";
import type { SkillLevel } from "@/types/player";

type PublicProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  skill_level: SkillLevel | null;
  dupr_rating: number | null;
  role: string | null;
};

export function PlayerProfilePage({ playerId }: { playerId: string }) {
  const currentUserId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const { isFollowing, toggleFollow } = useFollows(currentUserId);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [matches, setMatches] = useState(0);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUserId === playerId;

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      const supabase = createClient();

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, city, skill_level, dupr_rating, role")
        .eq("id", playerId)
        .maybeSingle();

      setProfile(data as PublicProfile | null);

      const [followersCount, followingCount, matchesCountResult] =
        await Promise.all([
          fetchFollowerCount(playerId),
          fetchFollowingCount(playerId),
          supabase
            .from("match_players")
            .select("*", { count: "exact", head: true })
            .eq("player_id", playerId),
        ]);

      setFollowers(followersCount);
      setFollowing(followingCount);
      setMatches(matchesCountResult.count ?? 0);

      setLoading(false);
    }

    void loadProfile();
  }, [playerId]);

  if (loading) {
    return (
      <AppLayout title="Player Profile">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout title="Player Profile">
        <p className="text-sm text-muted-foreground">Player not found.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Player Profile">
      <div className="mx-auto flex max-w-lg flex-col gap-5">
        <div className="card-base flex flex-col items-center gap-4 p-6 text-center">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name ?? "Player"}
            size="xl"
            ring
          />

          <div>
            <h1 className="text-xl font-bold text-foreground">
              {profile.full_name ?? "Unnamed Player"}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {profile.city ?? "Unknown city"}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="primary">
              Rating {formatDupr(profile.dupr_rating ?? 0)}
            </Badge>

            <Badge variant="outline">
              {profile.skill_level ?? "3.0"}
            </Badge>
          </div>

          <div className="mt-4 grid w-full grid-cols-3 divide-x rounded-xl border border-border">
            <div className="py-3 text-center">
              <p className="text-xl font-bold">{matches}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>

            <div className="py-3 text-center">
              <p className="text-xl font-bold">{followers}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>

            <div className="py-3 text-center">
              <p className="text-xl font-bold">{following}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>

          {isOwnProfile ? (
            <Link href="/profile" className="btn-outline w-full text-center">
              Edit Profile
            </Link>
          ) : (
            <button
              type="button"
              onClick={() =>
                void toggleFollow(
                  profile.id,
                  profile.full_name ?? "Player"
                )
              }
              className="btn-primary w-full"
            >
              {isFollowing(profile.id) ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}