"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import {

  ArrowRightOnRectangleIcon,

  ChevronLeftIcon,

  ChevronRightIcon,

} from "@heroicons/react/24/outline";

import { AppLogo } from "@/components/ui/AppLogo";

import { cn } from "@/lib/utils";

import { useSignOut } from "@/hooks/useSignOut";

import { useAuthStore } from "@/store/authStore";

import { getDefaultHomeForRole } from "@/lib/auth/routeGuards";

import { getSidebarNavForRole, isNavItemActive } from "./navItems";



interface SidebarProps {

  collapsed: boolean;

  onToggle: () => void;

}



export function Sidebar({ collapsed, onToggle }: SidebarProps) {

  const pathname = usePathname();

  const role = useAuthStore((s) => s.profile?.role);

  const { signOut, pending } = useSignOut();

  const navItems = getSidebarNavForRole(role);



  return (

    <aside

      className={cn(

        "fixed inset-y-0 left-0 z-40 hidden flex-col glass-strong transition-[width] duration-300 ease-in-out md:flex",

        collapsed ? "w-16" : "w-60"

      )}

      aria-label="Main navigation"

    >

      <div

        className={cn(

          "flex h-16 shrink-0 items-center border-b border-border",

          collapsed ? "justify-center px-2" : "px-4"

        )}

      >

        <AppLogo

          showText={!collapsed}

          iconSize={collapsed ? 28 : 36}

          href={getDefaultHomeForRole(role)}

        />

      </div>



      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">

        {navItems.map((item) => {

          const active = isNavItemActive(pathname, item.href);

          const Icon = active ? item.activeIcon : item.icon;



          return (

            <Link

              key={item.id}

              href={item.href}

              title={collapsed ? item.label : undefined}

              className={cn(

                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",

                active

                  ? "nav-item-active"

                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",

                collapsed && "justify-center px-2"

              )}

            >

              <Icon

                className={cn(

                  "h-5 w-5 shrink-0 transition-transform duration-200",

                  active && "text-primary",

                  !active && "group-hover:scale-110"

                )}

                aria-hidden="true"

              />

   {!collapsed &&
  (item.id === "live" ? (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
      </span>

      <span className="font-semibold uppercase tracking-wide text-red-500 animate-pulse">
        LIVE
      </span>
    </div>
  ) : (
    <span className="truncate">{item.label}</span>
  ))}

            </Link>

          );

        })}

      </nav>



      <div className="space-y-1 border-t border-border p-2">

        <button

          type="button"

          onClick={() => void signOut()}

          disabled={pending}

          title={collapsed ? "Sign out" : undefined}

          className={cn(

            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-all hover:bg-danger/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",

            collapsed && "justify-center px-2"

          )}

          aria-label="Sign out"

        >

          <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />

          {!collapsed && <span>{pending ? "Signing out…" : "Sign out"}</span>}

        </button>



        <button

          type="button"

          onClick={onToggle}

          className={cn(

            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",

            collapsed && "justify-center px-2"

          )}

          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}

        >

          {collapsed ? (

            <ChevronRightIcon className="h-5 w-5" />

          ) : (

            <>

              <ChevronLeftIcon className="h-5 w-5" />

              <span>Collapse</span>

            </>

          )}

        </button>

      </div>

    </aside>

  );

}

