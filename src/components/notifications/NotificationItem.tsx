"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";
import { NotificationIcon } from "./notificationIcons";

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
        notification.read
          ? "border-border bg-background hover:bg-muted/40"
          : "border-primary/20 bg-primary/5 hover:bg-primary/10"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
          notification.read
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary"
        )}
      >
        <NotificationIcon icon={notification.icon} className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm leading-snug",
            notification.read
              ? "text-muted-foreground"
              : "font-medium text-foreground"
          )}
        >
          {notification.text}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>

      {!notification.read && (
        <span
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
          aria-label="Unread"
        />
      )}
    </button>
  );
}

interface NotificationEmptyStateProps {
  filter: "all" | "unread";
}

export function NotificationEmptyState({ filter }: NotificationEmptyStateProps) {
  return (
    <div className="card-base px-6 py-12 text-center">
      <p className="font-semibold text-foreground">
        {filter === "unread" ? "You're all caught up" : "No notifications yet"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {filter === "unread"
          ? "No unread notifications right now."
          : "Follow requests, match invites, results, and bookings will show up here."}
      </p>
      <Link href="/discover" className="btn-outline mt-4 inline-block text-sm">
        Find players
      </Link>
    </div>
  );
}
