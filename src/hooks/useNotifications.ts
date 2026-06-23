"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/db/config";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  mapDbNotification,
} from "@/lib/db/notifications";
import {
  getMockNotifications,
  markAllMockNotificationsRead,
  markMockNotificationRead,
} from "@/lib/notifications/mockNotifications";
import { useAuthStore } from "@/store/authStore";
import type { AppNotification, DbNotification } from "@/types/notification";

export interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  source: "supabase" | "mock";
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reload: () => void;
}

export function useNotifications(): UseNotificationsResult {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "mock">("mock");
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured() || !user?.id) {
        if (!cancelled) {
          setNotifications(getMockNotifications());
          setSource("mock");
          setLoading(false);
        }
        return;
      }

      try {
        const rows = await fetchNotifications(user.id);
        if (cancelled) return;

        setNotifications(rows);
        setSource("supabase");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load notifications"
          );
          setNotifications([]);
          setSource("supabase");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, reloadToken]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id || source !== "supabase") return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as DbNotification;
          const notification = mapDbNotification(row);
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notification.id)) return prev;
            return [notification, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as DbNotification;
          const notification = mapDbNotification(row);
          setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? notification : n))
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, source]);

  const markRead = useCallback(
    async (id: string) => {
      if (source === "mock" || !isSupabaseConfigured()) {
        const updated = markMockNotificationRead(id);
        if (updated) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? updated : n))
          );
        }
        return;
      }

      const updated = await markNotificationRead(id);
      if (updated) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? updated : n))
        );
      }
    },
    [source]
  );

  const markAllRead = useCallback(async () => {
    if (source === "mock" || !isSupabaseConfigured() || !user?.id) {
      markAllMockNotificationsRead();
      setNotifications(getMockNotifications());
      return;
    }

    const ok = await markAllNotificationsRead(user.id);
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, [source, user?.id]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    loading,
    error,
    source,
    markRead,
    markAllRead,
    reload,
  };
}
