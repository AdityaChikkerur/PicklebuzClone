"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { fetchFollowers } from "@/lib/db/follows";

type FollowUser = {
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
    skill_level: string | null;
    dupr_rating: number | null;
  } | null;
};

export default function FollowersPage() {
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const [followers, setFollowers] = useState<FollowUser[]>([]);

  useEffect(() => {
  if (!userId) return;

  const currentUserId = userId;

  async function loadFollowers() {
    const data = await fetchFollowers(currentUserId);
    setFollowers(data as unknown as FollowUser[]);
  }

  void loadFollowers();
}, [userId]);

  return (
    <AppLayout title="Followers">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold">Followers</h1>

        {followers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No followers yet.</p>
        ) : (
          followers.map((item) => {
            const user = item.profiles;
            if (!user) return null;

            return (
              <Link
                key={user.id}
                href={`/player/${user.id}`}
                className="card-base flex items-center gap-3 p-4 transition hover:bg-muted"
              >
                <Avatar
                  src={user.avatar_url ?? undefined}
                  name={user.full_name ?? "Player"}
                  size="md"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {user.full_name ?? "Unnamed Player"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {user.city ?? "Unknown city"}
                  </p>
                </div>

                <Badge variant="outline">{user.skill_level ?? "3.0"}</Badge>
              </Link>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}