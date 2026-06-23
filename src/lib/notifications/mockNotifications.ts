import type { AppNotification } from "@/types/notification";
import { EXTENDED_NOTIFICATIONS } from "@/lib/mock/extendedMockData";

const STORAGE_KEY = "picklebuzz-mock-notifications-read";

function readReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function getMockNotifications(): AppNotification[] {
  const readIds = readReadIds();
  return EXTENDED_NOTIFICATIONS.map((n) => ({
    ...n,
    read: n.read || readIds.has(n.id),
  })).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function markMockNotificationRead(
  notificationId: string
): AppNotification | null {
  const notification = EXTENDED_NOTIFICATIONS.find((n) => n.id === notificationId);
  if (!notification) return null;

  const readIds = readReadIds();
  readIds.add(notificationId);
  writeReadIds(readIds);

  return { ...notification, read: true };
}

export function markAllMockNotificationsRead(): void {
  const readIds = readReadIds();
  for (const n of EXTENDED_NOTIFICATIONS) {
    readIds.add(n.id);
  }
  writeReadIds(readIds);
}
