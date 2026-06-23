import { XMarkIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function Chip({
  label,
  active = false,
  onClick,
  onRemove,
  className,
}: ChipProps) {
  const isInteractive = Boolean(onClick);

  return (
    <span
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground border border-border",
        isInteractive && "cursor-pointer hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Remove ${label} filter`}
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
