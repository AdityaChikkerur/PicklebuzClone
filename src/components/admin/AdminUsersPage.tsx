"use client";

import Link from "next/link";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAdminUsers } from "@/hooks/useAdminDashboard";
import { useAuthStore } from "@/store/authStore";
import { formatDupr } from "@/lib/utils";
import { USER_ROLES } from "@/types/player";

export function AdminUsersPage() {
  const profile = useAuthStore((s) => s.profile);
  const {
    users,
    loading,
    search,
    setSearch,
    toggleBan,
    toggleVerify,
    toggleBoost,
  } = useAdminUsers();

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    return (
      <AppLayout title="Users">
        <p className="text-center text-sm text-muted-foreground">
          Admin access required.{" "}
          <Link href="/auth" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </AppLayout>
    );
  }

  const roleLabel = (role: string) =>
    USER_ROLES.find((r) => r.value === role)?.label ?? role;

  return (
    <AppLayout title="User management">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to admin
        </Link>

        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, city, or role…"
            className="input-base w-full pl-10"
          />
        </div>

        {loading ? (
          <div className="card-base h-64 animate-pulse bg-muted/50" />
        ) : (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">DUPR</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={null}
                            name={u.fullName}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {u.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {roleLabel(u.role)}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {formatDupr(u.duprRating)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.verified && (
                            <Badge variant="success">Verified</Badge>
                          )}
                          {u.banned && <Badge variant="danger">Banned</Badge>}
                          {u.boosted && (
                            <Badge variant="secondary">Boosted</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <ActionButton
                            label={u.banned ? "Unban" : "Ban"}
                            onClick={() => {
                              toggleBan(u.id);
                              toast.success(
                                u.banned ? "User unbanned" : "User banned"
                              );
                            }}
                            danger={!u.banned}
                          />
                          <ActionButton
                            label={u.verified ? "Unverify" : "Verify"}
                            onClick={() => {
                              toggleVerify(u.id);
                              toast.success("Verification updated");
                            }}
                          />
                          <ActionButton
                            label={u.boosted ? "Remove boost" : "Boost"}
                            onClick={() => {
                              toggleBoost(u.id);
                              toast.success("Boost updated");
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ActionButton({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-semibold hover:underline ${
        danger ? "text-danger" : "text-primary"
      }`}
    >
      {label}
    </button>
  );
}
