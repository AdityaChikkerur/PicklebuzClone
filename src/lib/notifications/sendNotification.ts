import { isSupabaseConfigured } from "@/lib/auth/isSupabaseConfigured";
import {
  createNotification,
  type CreateNotificationInput,
} from "@/lib/db/notifications";
import { pushMockNotification } from "./mockNotifications";

/** Send an inbox notification (Supabase or demo localStorage). */
export async function sendNotification(
  input: CreateNotificationInput
): Promise<void> {
  if (!isSupabaseConfigured()) {
    pushMockNotification(input);
    return;
  }

  await createNotification(input);
}

/** Notify multiple users with the same payload shape. */
export async function sendNotifications(
  userIds: string[],
  payload: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  const unique = [...new Set(userIds.filter(Boolean))];
  await Promise.all(
    unique.map((userId) => sendNotification({ ...payload, userId }))
  );
}
