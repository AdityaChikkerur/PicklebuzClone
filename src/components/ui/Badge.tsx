import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "live"
  | "win"
  | "loss"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-green-light text-primary border border-primary/20",
  secondary: "bg-muted text-foreground border border-border",
  success: "bg-green-light text-primary",
  warning: "bg-amber-light text-amber-brand",
  danger: "bg-red-light text-red-brand",
  live: "bg-red-brand text-white shadow-[0_0_12px_rgba(255,71,87,0.4)]",
  win: "bg-green-light text-primary",
  loss: "bg-red-light text-red-brand",
  outline: "border border-border text-muted-foreground bg-transparent",
};

export function Badge({
  children,
  variant = "default",
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "live" ? "bg-white live-pulse" : "bg-current"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
