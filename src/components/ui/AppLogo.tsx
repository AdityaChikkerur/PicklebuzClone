import Link from "next/link";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  showTagline?: boolean;
  href?: string;
  variant?: "default" | "hero" | "compact";
}

export function AppLogo({
  className,
  iconSize = 32,
  showText = true,
  showTagline = false,
  href = "/dashboard",
  variant = "default",
}: AppLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(variant === "hero" && "animate-float")}>
        <AppIcon size={iconSize} />
      </div>
      {(showText || showTagline) && (
        <div className="flex flex-col">
          {showText && (
            <span
              className={cn(
                "font-display font-black italic leading-none tracking-tight",
                variant === "hero" ? "text-3xl sm:text-4xl" : "text-lg"
              )}
            >
              <span className="text-foreground">Pickle</span>
              <span className="text-primary">Buzz</span>
            </span>
          )}
          {showTagline && (
            <span className="tagline mt-1.5 text-[9px] sm:text-[10px]">
              Play • Connect • Compete
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl transition-opacity hover:opacity-90"
      >
        {content}
      </Link>
    );
  }

  return content;
}
