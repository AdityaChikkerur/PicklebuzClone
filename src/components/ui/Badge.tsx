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
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  live: "bg-danger text-white",
  win: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  loss: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
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
            variant === "live" ? "bg-white animate-pulse" : "bg-current"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
