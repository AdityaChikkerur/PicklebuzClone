import type { Metadata } from "next";
import { AdminUsersPage } from "@/components/admin";

export const metadata: Metadata = {
  title: "User Management",
};

export default function AdminUsersRoutePage() {
  return <AdminUsersPage />;
}
