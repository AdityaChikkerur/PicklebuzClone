import type { AppNotification } from "@/types/notification";
import { EXTENDED_NOTIFICATIONS } from "@/lib/mock/extendedMockData";
import type { CreateNotificationInput } from "@/lib/db/notifications";

const STORAGE_KEY = "picklebuzz-mock-notifications-read";
const DYNAMIC_KEY = "picklebuzz-dynamic-notifications";

export const NOTIFICATIONS_UPDATED_EVENT = "picklebuzz-notifications-updated";

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

function readDynamicNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DYNAMIC_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function writeDynamicNotifications(notifications: AppNotification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DYNAMIC_KEY, JSON.stringify(notifications));
}

export function pushMockNotification(input: CreateNotificationInput): AppNotification {
  const notification: AppNotification = {
    id: crypto.randomUUID(),
    userId: input.userId,
    icon: input.icon ?? "bell",
    text: input.text,
    link: input.link ?? "/dashboard",
    read: false,
    createdAt: new Date().toISOString(),
  };

  const dynamic = readDynamicNotifications();
  dynamic.unshift(notification);
  writeDynamicNotifications(dynamic.slice(0, 100));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
  }

  return notification;
}

export function getMockNotifications(userId?: string): AppNotification[] {
  const readIds = readReadIds();
  const dynamic = readDynamicNotifications().map((n) => ({
    ...n,
    read: n.read || readIds.has(n.id),
  }));

  const seeded = EXTENDED_NOTIFICATIONS.map((n) => ({
    ...n,
    userId: n.userId === "current-user" && userId ? userId : n.userId,
    read: n.read || readIds.has(n.id),
  }));

  const combined = [...dynamic, ...seeded];
  const filtered = userId
    ? combined.filter((n) => n.userId === userId)
    : combined;

  return filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function markMockNotificationRead(
  notificationId: string
): AppNotification | null {
  const all = getMockNotifications();
  const notification = all.find((n) => n.id === notificationId);
  if (!notification) return null;

  const readIds = readReadIds();
  readIds.add(notificationId);
  writeReadIds(readIds);

  return { ...notification, read: true };
}

export function markAllMockNotificationsRead(): void {
  const readIds = readReadIds();
  for (const n of getMockNotifications()) {
    readIds.add(n.id);
  }
  writeReadIds(readIds);
}
