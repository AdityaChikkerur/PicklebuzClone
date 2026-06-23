import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  UserPlusIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

const ICON_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  trophy: TrophyIcon,
  clipboard: ClipboardDocumentCheckIcon,
  exclamation: ExclamationTriangleIcon,
  calendar: CalendarDaysIcon,
  invite: UserPlusIcon,
  bell: BellIcon,
};

export function isEmojiIcon(icon: string): boolean {
  return /\p{Emoji}/u.test(icon);
}

export function NotificationIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  if (isEmojiIcon(icon)) {
    return <span className={className} aria-hidden="true">{icon}</span>;
  }

  const Icon = ICON_MAP[icon] ?? BellIcon;
  return <Icon className={className} aria-hidden="true" />;
}
