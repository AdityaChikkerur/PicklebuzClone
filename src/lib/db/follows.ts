import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { createClient } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications/sendNotification";

const FOLLOWS_KEY = "pb_player_follows";

function readMockFollows(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FOLLOWS_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    return new Set(all[userId] ?? []);
  } catch {
    return new Set();
  }
}

function writeMockFollows(userId: string, following: Set<string>): void {
  const raw = localStorage.getItem(FOLLOWS_KEY);
  const all = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  all[userId] = [...following];
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(all));
}

export async function fetchFollowingIds(userId: string): Promise<Set<string>> {
  if (!isSupabaseConfigured()) {
    return readMockFollows(userId);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("player_follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (error || !data) return readMockFollows(userId);
  return new Set(data.map((row) => row.following_id as string));
}

export async function followPlayer(
  followerId: string,
  followingId: string,
  followerName?: string
): Promise<boolean> {
  if (followerId === followingId) return false;

  if (!isSupabaseConfigured()) {
    const set = readMockFollows(followerId);
    set.add(followingId);
    writeMockFollows(followerId, set);
    await sendNotification({
      userId: followingId,
      icon: "invite",
      text: `${followerName ?? "Someone"} started following you`,
      link: "/discover",
    });
    return true;
  }

  const supabase = createClient();
  const { error } = await supabase.from("player_follows").insert({
    follower_id: followerId,
    following_id: followingId,
  });

  if (!error) {
    await sendNotification({
      userId: followingId,
      icon: "invite",
      text: `${followerName ?? "Someone"} started following you`,
      link: "/discover",
    });
  }

  return !error;
}

export async function unfollowPlayer(
  followerId: string,
  followingId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const set = readMockFollows(followerId);
    set.delete(followingId);
    writeMockFollows(followerId, set);
    return true;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("player_follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  return !error;
}

export async function fetchFollowerCount(playerId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = createClient();
  const { count, error } = await supabase
    .from("player_follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", playerId);

  if (error) return 0;
  return count ?? 0;
}
