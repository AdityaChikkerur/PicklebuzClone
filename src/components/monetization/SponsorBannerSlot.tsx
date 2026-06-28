import { MegaphoneIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface SponsorBannerSlotProps {
  label?: string;
  className?: string;
  variant?: "default" | "compact";
}

export function SponsorBannerSlot({
  label = "Sponsored",
  className,
  variant = "default",
}: SponsorBannerSlotProps) {
  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-xl border border-dashed border-border bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40",
        variant === "compact" ? "px-4 py-3" : "px-6 py-8 text-center",
        className
      )}
      aria-label="Sponsor advertisement placeholder"
    >
      <span
        className="absolute right-3 top-3 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_14px_rgba(200,255,0,0.45)] ring-1 ring-primary/40"
        aria-hidden="true"
      >
        New
      </span>
      <div
        className={cn(
          "flex items-center gap-3",
          variant === "default" && "mx-auto max-w-md flex-col sm:flex-row"
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MegaphoneIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className={cn(variant === "default" && "text-center sm:text-left")}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            Your brand here
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sponsor banner slot · no ads served in Phase 2
          </p>
        </div>
      </div>
    </aside>
  );
}

