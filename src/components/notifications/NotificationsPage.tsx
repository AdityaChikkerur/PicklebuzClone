"use client";

import { useMemo, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Chip } from "@/components/ui/Chip";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationEmptyState, NotificationItem } from "./NotificationItem";

type FilterTab = "all" | "unread";

export function NotificationsPage() {
  const { notifications, loading, error, markRead, markAllRead } =
    useNotifications();
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success("All notifications marked as read");
  };

  return (
    <AppLayout title="Notifications">
      <div className="mx-auto flex max-w-lg flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Inbox</p>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {unreadCount} unread
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              className="btn-outline inline-flex shrink-0 items-center gap-1.5 text-sm"
            >
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
              Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Chip
            label="All"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <Chip
            label={`Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
            active={filter === "unread"}
            onClick={() => setFilter("unread")}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}. Showing demo notifications.
          </p>
        )}

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card-base h-20 animate-pulse bg-muted/50"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <NotificationEmptyState filter={filter} />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => void markRead(id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
