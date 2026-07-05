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
  ExclamationTriangleIcon,
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
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  BellIcon as BellIconSolid,
} from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";
import type { UserRole } from "@/types/player";
import { getDefaultHomeForRole, isPlayerRole } from "@/lib/auth/routeGuards";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  activeIcon: ComponentType<SVGProps<SVGSVGElement>>;
  roles?: UserRole[];
  /** Hide from nav when user's role is in this list */
  excludeRoles?: UserRole[];
}

const PROFILE_ITEM: NavItem = {
  id: "profile",
  label: "Profile",
  href: "/profile",
  icon: UserCircleIcon,
  activeIcon: UserCircleIconSolid,
};

function homeItem(role: UserRole | undefined): NavItem {
  const href = getDefaultHomeForRole(role);
  const label =
    role === "organizer"
      ? "Events"
      : role === "referee"
        ? "Assign"
        : role === "club_owner"
          ? "Club"
          : role === "admin"
            ? "Admin"
            : "Home";

  return {
    id: "home",
    label,
    href,
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  };
}

/** Mobile bottom navigation — role-aware. */
export function getBottomNavForRole(role: UserRole | undefined): NavItem[] {
  if (role === "organizer") {
    return [
      homeItem(role),
      {
        id: "live",
        label: "Live",
        href: "/live-scoring",
        icon: TrophyIcon,
        activeIcon: TrophyIconSolid,
      },
      {
        id: "create",
        label: "Event",
        href: "/create-tournament",
        icon: PlusCircleIcon,
        activeIcon: PlusCircleIconSolid,
      },
      {
        id: "notifications",
        label: "Inbox",
        href: "/notifications",
        icon: BellIcon,
        activeIcon: BellIconSolid,
      },
      PROFILE_ITEM,
    ];
  }

  if (role === "referee") {
    return [
      homeItem(role),
      {
        id: "live",
        label: "Live",
        href: "/live-scoring",
        icon: TrophyIcon,
        activeIcon: TrophyIconSolid,
      },
      {
        id: "rankings",
        label: "Rankings",
        href: "/rankings",
        icon: ChartBarIcon,
        activeIcon: ChartBarIconSolid,
      },
      PROFILE_ITEM,
    ];
  }

  if (role === "club_owner") {
    return [
      homeItem(role),
      {
        id: "clubs",
        label: "Courts",
        href: "/clubs",
        icon: BuildingStorefrontIcon,
        activeIcon: BuildingStorefrontIconSolid,
      },
      {
        id: "notifications",
        label: "Inbox",
        href: "/notifications",
        icon: BellIcon,
        activeIcon: BellIconSolid,
      },
      PROFILE_ITEM,
    ];
  }

  if (role === "admin") {
    return [
      homeItem(role),
      {
        id: "disputes",
        label: "Disputes",
        href: "/admin/disputes",
        icon: ExclamationTriangleIcon,
        activeIcon: ExclamationTriangleIconSolid,
      },
      {
        id: "users",
        label: "Users",
        href: "/admin/users",
        icon: UserGroupIcon,
        activeIcon: UserGroupIcon,
      },
      PROFILE_ITEM,
    ];
  }

  // Player (default)
  return [
    homeItem(role),
    {
      id: "live",
      label: "Live",
      href: "/live-scoring",
      icon: TrophyIcon,
      activeIcon: TrophyIconSolid,
    },
    {
      id: "create",
      label: "Score",
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
    PROFILE_ITEM,
  ];
}

/** @deprecated Use getBottomNavForRole — kept for tests */
export const BOTTOM_NAV_ITEMS = getBottomNavForRole("player");

const SHARED_SIDEBAR: NavItem[] = [
  {
    id: "live",
    label: "Live matches",
    href: "/live-scoring",
    icon: TrophyIcon,
    activeIcon: TrophyIconSolid,
  },
  {
    id: "clubs",
    label: "Clubs",
    href: "/clubs",
    icon: BuildingStorefrontIcon,
    activeIcon: BuildingStorefrontIconSolid,
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: BellIcon,
    activeIcon: BellIconSolid,
  },
];

const PLAYER_SIDEBAR: NavItem[] = [
  {
    id: "discover",
    label: "Discover",
    href: "/discover",
    icon: UserGroupIcon,
    activeIcon: UserGroupIcon,
  },
  {
    id: "rankings",
    label: "Rankings",
    href: "/rankings",
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
  {
    id: "match-setup",
    label: "New match",
    href: "/match-setup",
    icon: PlusCircleIcon,
    activeIcon: PlusCircleIconSolid,
  },
    {
    id: "tournaments",
    label: "Tournaments",
    href: "/create-tournament",
    icon: TrophyIcon,
    activeIcon: TrophyIconSolid,
  },
  {
    id: "stats",
    label: "Stats",
    href: "/stats",
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
];

const STAFF_SIDEBAR: NavItem[] = [
  {
    id: "referee",
    label: "Referee desk",
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
    label: "Organizer desk",
    href: "/organizer",
    icon: ClipboardDocumentListIcon,
    activeIcon: ClipboardDocumentListIconSolid,
    roles: ["organizer", "admin"],
  },
  {
    id: "tournament",
    label: "Create tournament",
    href: "/create-tournament",
    icon: MapPinIcon,
    activeIcon: MapPinIcon,
    roles: ["organizer", "admin"],
  },
  {
    id: "admin",
    label: "Admin console",
    href: "/admin",
    icon: ShieldCheckIcon,
    activeIcon: ShieldCheckIconSolid,
    roles: ["admin"],
  },
  {
    id: "flagged",
    label: "Flagged scores",
    href: "/admin/flagged",
    icon: ExclamationTriangleIcon,
    activeIcon: ExclamationTriangleIconSolid,
    roles: ["admin"],
  },
];

/** Desktop sidebar — role-aware home + filtered sections. */
export function getSidebarNavForRole(role: UserRole | undefined): NavItem[] {
  const items: NavItem[] = [homeItem(role), PROFILE_ITEM];

  if (isPlayerRole(role)) {
    items.push(...PLAYER_SIDEBAR);
  } else if (role === "organizer") {
    items.push(
      {
        id: "organizer",
        label: "Organizer desk",
        href: "/organizer",
        icon: ClipboardDocumentListIcon,
        activeIcon: ClipboardDocumentListIconSolid,
      },
      {
        id: "tournament",
        label: "Create tournament",
        href: "/create-tournament",
        icon: MapPinIcon,
        activeIcon: MapPinIcon,
      }
    );
  } else if (role === "referee") {
    items.push({
      id: "referee",
      label: "Referee desk",
      href: "/referee",
      icon: ClipboardDocumentCheckIcon,
      activeIcon: ClipboardDocumentCheckIconSolid,
    });
  } else if (role === "club_owner") {
    items.push(
      {
        id: "club-dashboard",
        label: "Club dashboard",
        href: "/club-dashboard",
        icon: CalendarDaysIcon,
        activeIcon: CalendarDaysIconSolid,
      },
      {
        id: "clubs",
        label: "Browse clubs",
        href: "/clubs",
        icon: BuildingStorefrontIcon,
        activeIcon: BuildingStorefrontIconSolid,
      }
    );
  } else if (role === "admin") {
    items.push(...STAFF_SIDEBAR);
  }

  items.push(...SHARED_SIDEBAR.filter((item) => item.id !== "clubs" || role !== "club_owner"));

  // Admin sees all staff links via STAFF_SIDEBAR; others get filtered staff links
  if (role === "admin") {
    return filterNavItemsByRole(items, role);
  }

  if (!isPlayerRole(role)) {
    return items;
  }

  return filterNavItemsByRole([...items, ...STAFF_SIDEBAR], role);
}

/** @deprecated Use getSidebarNavForRole */
export const SIDEBAR_NAV_ITEMS = getSidebarNavForRole("player");

export function isNavItemActive(pathname: string, href: string): boolean {
  const [path, hash] = href.split("#");
  if (hash) {
    return pathname === path;
  }

  const homePaths = new Set([
    "/dashboard",
    "/organizer",
    "/referee",
    "/club-dashboard",
    "/admin",
  ]);

  if (homePaths.has(path)) {
    return pathname === path || (path === "/admin" && pathname.startsWith("/admin/"));
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
    if (item.excludeRoles?.length && role && item.excludeRoles.includes(role)) {
      return false;
    }
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });
}
