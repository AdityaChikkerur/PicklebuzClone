import { cn } from "@/lib/utils";

interface AppIconProps {
  className?: string;
  size?: number;
  variant?: "default" | "neon-bg" | "minimal";
}

export function AppIcon({ className, size = 32, variant = "default" }: AppIconProps) {
  const id = `pb-icon-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-neon`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8FF66" />
          <stop offset="50%" stopColor="#C8FF00" />
          <stop offset="100%" stopColor="#9ED600" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect
        width="64"
        height="64"
        rx="14"
        fill={variant === "neon-bg" ? `url(#${id}-neon)` : "#0A0A0B"}
        stroke={variant === "neon-bg" ? "none" : "rgba(200,255,0,0.15)"}
        strokeWidth="0.5"
      />

      {/* Motion trails from pickleball */}
      <path
        d="M14 28h-6M14 32h-5M14 36h-4"
        stroke={variant === "neon-bg" ? "#0A0A0B" : "#C8FF00"}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Pickleball */}
      <circle
        cx="18"
        cy="32"
        r="7"
        fill={variant === "neon-bg" ? "#0A0A0B" : "#C8FF00"}
        filter={variant !== "neon-bg" ? `url(#${id}-glow)` : undefined}
      />
      <circle cx="16" cy="30" r="1" fill={variant === "neon-bg" ? "#C8FF00" : "#0A0A0B"} opacity="0.7" />
      <circle cx="20" cy="31" r="1" fill={variant === "neon-bg" ? "#C8FF00" : "#0A0A0B"} opacity="0.7" />
      <circle cx="18" cy="34" r="1" fill={variant === "neon-bg" ? "#C8FF00" : "#0A0A0B"} opacity="0.7" />
      <circle cx="21" cy="34" r="0.8" fill={variant === "neon-bg" ? "#C8FF00" : "#0A0A0B"} opacity="0.5" />

      {/* B/P letterform */}
      <path
        d="M26 16v32M26 16h14c6 0 10 3 10 8s-4 8-10 8h-6c6 0 10 3 10 8s-4 8-10 8H26"
        stroke={variant === "neon-bg" ? "#0A0A0B" : `url(#${id}-neon)`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={variant !== "neon-bg" ? `url(#${id}-glow)` : undefined}
      />

      {/* Speech bubble tail */}
      <path
        d="M26 48L20 56L24 48"
        fill={variant === "neon-bg" ? "#0A0A0B" : "#C8FF00"}
        opacity="0.9"
      />

      {/* Buzz energy lines */}
      <g className="buzz-lines" opacity="0.9">
        <path
          d="M48 14l3-4M52 18l4-2M50 22l5 1"
          stroke={variant === "neon-bg" ? "#0A0A0B" : "#FFFFFF"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Lightning underline */}
      <path
        d="M38 52l4 3-3 1 2 4-5-4 3-1-3-3z"
        fill={variant === "neon-bg" ? "#0A0A0B" : "#C8FF00"}
        opacity="0.85"
      />
    </svg>
  );
}
