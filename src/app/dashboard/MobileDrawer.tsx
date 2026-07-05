"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  getSidebarNavForRole,
  isNavItemActive,
} from "@/components/layout/navItems";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.profile?.role);
  const navItems = getSidebarNavForRole(role);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <aside className="absolute left-0 top-0 h-full w-72 bg-background p-5 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-xl font-black italic">
            Pickle<span className="text-primary">Buzz</span>
          </h2>

          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            const Icon = active ? item.activeIcon : item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  active
                    ? "nav-item-active"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}