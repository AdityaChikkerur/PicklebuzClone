"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { Menu } from "lucide-react";

import { DashboardPage } from "@/components/dashboard";
import MobileDrawer from "./MobileDrawer";

// ❌ This will NOT work in a client component
// export const metadata: Metadata = {
//   title: "Dashboard",
// };

export default function DashboardRoutePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Existing Dashboard */}
      <DashboardPage />
    </>
  );
}