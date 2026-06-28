"use client";

import type { ReactNode } from "react";
import { NotificationsProvider } from "@/hooks/useNotifications";

export function AppProviders({ children }: { children: ReactNode }) {
  return <NotificationsProvider>{children}</NotificationsProvider>;
}
