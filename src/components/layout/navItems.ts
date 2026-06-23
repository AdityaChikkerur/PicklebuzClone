import {
  HomeIcon,
  TrophyIcon,
  PlusCircleIcon,
  ChartBarIcon,
  UserCircleIcon,
  UserGroupIcon,
  MapPinIcon,
  BellIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  TrophyIcon as TrophyIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid,
} from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";
import type { UserRole } from "@/types/player";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  activeIcon: ComponentType<SVGProps<SVGSVGElement>>;
  roles?: UserRole[];
}

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/dashboard",
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    id: "live",
    label: "Live",
    href: "/live-scoring",
    icon: TrophyIcon,
    activeIcon: TrophyIconSolid,
  },
  {
    id: "create",
    label: "Create",
    href: "/match-setup",
    icon: PlusCircleIcon,
    activeIcon: PlusCircleIconSolid,
  },
  {
    id: "rankings",
    label: "Rankings",
    href: "/rankings",
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: UserCircleIcon,
    activeIcon: UserCircleIconSolid,
  },
];

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  ...BOTTOM_NAV_ITEMS.filter((item) => item.id !== "create"),
  {
    id: "discover",
    label: "Discover",
    href: "/discover",
    icon: UserGroupIcon,
    activeIcon: UserGroupIcon,
  },
  {
    id: "clubs",
    label: "Clubs",
    href: "/clubs",
    icon: BuildingStorefrontIcon,
    activeIcon: BuildingStorefrontIconSolid,
  },
  {
    id: "tournament",
    label: "Tournaments",
    href: "/create-tournament",
    icon: MapPinIcon,
    activeIcon: MapPinIcon,
  },
  {
    id: "referee",
    label: "Referee",
    href: "/referee",
    icon: ClipboardDocumentCheckIcon,
    activeIcon: ClipboardDocumentCheckIconSolid,
    roles: ["referee", "admin"],
  },
  {
    id: "club-dashboard",
    label: "Club dashboard",
    href: "/club-dashboard",
    icon: CalendarDaysIcon,
    activeIcon: CalendarDaysIconSolid,
    roles: ["club_owner", "admin"],
  },
  {
    id: "organizer",
    label: "Organizer",
    href: "/organizer",
    icon: ClipboardDocumentListIcon,
    activeIcon: ClipboardDocumentListIconSolid,
    roles: ["organizer", "admin"],
  },
  {
    id: "admin",
    label: "Admin",
    href: "/admin",
    icon: ShieldCheckIcon,
    activeIcon: ShieldCheckIconSolid,
    roles: ["admin"],
  },
  {
    id: "stats",
    label: "Stats",
    href: "/stats",
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: BellIcon,
    activeIcon: BellIcon,
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  const [path, hash] = href.split("#");
  if (hash) {
    return pathname === path;
  }
  if (path === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (path === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/");
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function filterNavItemsByRole(
  items: NavItem[],
  role: UserRole | undefined
): NavItem[] {
  return items.filter((item) => {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });
}
