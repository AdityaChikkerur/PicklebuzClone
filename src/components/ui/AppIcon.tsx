import { cn } from "@/lib/utils";

interface AppIconProps {
  className?: string;
  size?: number;
}

export function AppIcon({ className, size = 32 }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="16" r="2" fill="white" />
      <path
        d="M16 7v4M16 21v4M7 16h4M21 16h4"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.5 10.5l2.8 2.8M18.7 18.7l2.8 2.8M21.5 10.5l-2.8 2.8M13.3 18.7l-2.8 2.8"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
