import { cn, getInitials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
}

const sizeMap: Record<AvatarSize, { px: number; text: string }> = {
  xs: { px: 24, text: "text-[10px]" },
  sm: { px: 32, text: "text-xs" },
  md: { px: 40, text: "text-sm" },
  lg: { px: 48, text: "text-base" },
  xl: { px: 64, text: "text-lg" },
};

export function Avatar({
  src,
  name,
  size = "md",
  className,
  ring = false,
}: AvatarProps) {
  const { px, text } = sizeMap[size];
  const initials = getInitials(name);

  const ringClass = ring
    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
    : "";

  if (src) {
    // Use native img for remote avatars (Dicebear PNG/SVG) — avoids next/image SVG issues
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={px}
        height={px}
        className={cn(
          "rounded-full object-cover bg-muted shrink-0",
          ringClass,
          className
        )}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center shrink-0",
        text,
        ring && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        className
      )}
      style={{ width: px, height: px }}
      aria-label={name}
      role="img"
    >
      {initials}
    </div>
  );
}
