"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { BottomNav } from "./BottomNav";

import { NotificationBell } from "./NotificationBell";

import { AccountMenu } from "./AccountMenu";

import { Sidebar } from "./Sidebar";

import { Menu } from "lucide-react";

import MobileDrawer from "@/app/dashboard/MobileDrawer";


interface AppLayoutProps {

  children: React.ReactNode;

  title?: string;

  /** Hide sidebar and bottom nav (e.g. live scoring fullscreen) */

  hideNav?: boolean;

  /** Hide the top header bar (e.g. dashboard uses its own header) */

  hideHeader?: boolean;

}



export function AppLayout({ children, title, hideNav = false, hideHeader = false }: AppLayoutProps) {

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);




  useEffect(() => {

    const stored = localStorage.getItem("picklebuzz-sidebar-collapsed");

    if (stored === "true") {

      setCollapsed(true);

    }

  }, []);



  const toggleSidebar = () => {

    setCollapsed((prev) => {

      const next = !prev;

      localStorage.setItem("picklebuzz-sidebar-collapsed", String(next));

      return next;

    });

  };



  if (hideNav) {

    return <>{children}</>;

  }



  return (

    <div className="min-h-screen bg-background">

      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <button
  onClick={() => setDrawerOpen(true)}
  className="fixed left-4 top-4 z-50 rounded-lg bg-card p-2 shadow md:hidden"
>
  <Menu className="h-6 w-6" />
</button>

<MobileDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
/>



      <div
  className={cn(
    "flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
    collapsed ? "pl-0 md:pl-16" : "pl-0 md:pl-60"
  )}
>

        {!hideHeader && (

        <header className="sticky top-0 z-30 glass border-b border-border">

          <div className="flex h-14 items-center justify-between gap-4 px-4 md:h-16 md:px-6">

            <div className="flex min-w-0 items-center gap-3 pl-14 md:hidden">
  <Link
    href="/dashboard"
    className="font-display truncate text-base font-black italic text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
  >
    {title ? (
      title
    ) : (
      <>
        Pickle<span className="text-primary">Buzz</span>
      </>
    )}
  </Link>
</div>



            {title && (

              <h1 className="hidden truncate font-display text-lg font-black italic text-foreground md:block">

                {title}

              </h1>

            )}



            <div className="ml-auto flex items-center gap-2 sm:gap-3">

              <NotificationBell />

              <AccountMenu />

            </div>

          </div>

        </header>

        )}



        <main className="flex-1 w-full overflow-x-hidden px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-6">
          {children}
        </main>



        <BottomNav />

      </div>

    </div>

  );

}

