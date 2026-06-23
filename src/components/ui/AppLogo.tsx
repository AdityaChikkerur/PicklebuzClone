import Link from "next/link";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  href?: string;
}

export function AppLogo({
  className,
  iconSize = 32,
  showText = true,
  href = "/dashboard",
}: AppLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <AppIcon size={iconSize} />
      {showText && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          {APP_NAME}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
