import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type { AppNotification, DbNotification } from "@/types/notification";

export function mapDbNotification(row: DbNotification): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    icon: row.icon ?? "bell",
    text: row.text,
    link: row.link ?? "/dashboard",
    read: row.read,
    createdAt: row.created_at,
  };
}

/** Fetch notifications for the authenticated user, newest first. */
export async function fetchNotifications(
  userId: string
): Promise<AppNotification[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as DbNotification[]).map(mapDbNotification);
}

/** Mark a single notification as read. */
export async function markNotificationRead(
  notificationId: string
): Promise<AppNotification | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .select("*")
    .single();

  if (error || !data) return null;
  return mapDbNotification(data as DbNotification);
}

export interface CreateNotificationInput {
  userId: string;
  icon?: string;
  text: string;
  link?: string;
}

/** Insert a single inbox notification for a user. */
export async function createNotification(
  input: CreateNotificationInput
): Promise<AppNotification | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.userId,
      icon: input.icon ?? "bell",
      text: input.text,
      link: input.link ?? "/dashboard",
      read: false,
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return mapDbNotification(data as DbNotification);
}

/** Insert notifications for multiple users (e.g. match opponents). */
export async function createNotifications(
  inputs: CreateNotificationInput[]
): Promise<void> {
  if (inputs.length === 0) return;
  return createNotificationsWithClient(createClient(), inputs);
}

export async function createNotificationsWithClient(
  supabase: SupabaseClient,
  inputs: CreateNotificationInput[]
): Promise<void> {
  if (inputs.length === 0) return;

  await supabase.from("notifications").insert(
    inputs.map((input) => ({
      user_id: input.userId,
      icon: input.icon ?? "bell",
      text: input.text,
      link: input.link ?? "/dashboard",
      read: false,
    }))
  );
}

/** Mark all notifications as read for a user. */
export async function markAllNotificationsRead(
  userId: string
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  return !error;
}
