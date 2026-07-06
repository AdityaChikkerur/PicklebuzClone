import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import { createClient } from "@/lib/supabase";
import { sendNotification } from "@/lib/notifications/sendNotification";

const FOLLOWS_KEY = "pb_player_follows";

export const FOLLOWS_UPDATED_EVENT = "pb-follows-updated";

function dispatchFollowsUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FOLLOWS_UPDATED_EVENT));
  }
}

function readAllMockFollows(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FOLLOWS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}
function readMockFollows(userId: string): Set<string> {
  const all = readAllMockFollows();
  return new Set(all[userId] ?? []);
}

function writeMockFollows(userId: string, following: Set<string>): void {
  const all = readAllMockFollows();
  all[userId] = [...following];
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(all));
  dispatchFollowsUpdated();
}

function countMockFollowers(playerId: string): number {
  const all = readAllMockFollows();
  return Object.values(all).filter((ids) => ids.includes(playerId)).length;
}

function countMockFollowing(playerId: string): number {
  return readMockFollows(playerId).size;
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
      link: "/profile",
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
      link: "/profile",
    });
    dispatchFollowsUpdated();
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

  if (!error) {
    dispatchFollowsUpdated();
  }

  return !error;
}

export async function fetchFollowerCount(playerId: string): Promise<number> {
  if (!isSupabaseConfigured()) return countMockFollowers(playerId);

  const supabase = createClient();
  const { count, error } = await supabase
    .from("player_follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", playerId);

  if (error) return 0;
  return count ?? 0;
}
export async function fetchFollowingCount(playerId: string): Promise<number> {
  if (!isSupabaseConfigured()) return countMockFollowing(playerId);

  const supabase = createClient();

  const { count, error } = await supabase
    .from("player_follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", playerId);

  if (error) return 0;

  return count ?? 0;
}

export async function fetchFollowers(playerId: string) {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();

  const { data, error } = await supabase
    .from("player_follows")
    .select(`
      follower_id,
      profiles:follower_id (
        id,
        full_name,
        avatar_url,
        city,
        skill_level,
        dupr_rating
      )
    `)
    .eq("following_id", playerId);

  if (error) {
    console.error("Error fetching followers:", error);
    return [];
  }

  return data ?? [];
}

export async function fetchFollowing(playerId: string) {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();

  const { data, error } = await supabase
    .from("player_follows")
    .select(`
      following_id,
      profiles:following_id (
        id,
        full_name,
        avatar_url,
        city,
        skill_level,
        dupr_rating
      )
    `)
    .eq("follower_id", playerId);

  if (error) {
    console.error("Error fetching following:", error);
    return [];
  }

  return data ?? [];
}