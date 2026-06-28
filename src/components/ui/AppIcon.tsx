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
        <radialGradient id={`${id}-ambient`} cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor="#C8FF00" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#C8FF00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-border`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8FF00" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#C8FF00" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#C8FF00" stopOpacity="0.2" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        width="64"
        height="64"
        rx="14.5"
        fill={variant === "neon-bg" ? `url(#${id}-neon)` : "#0A0A0B"}
      />
      {variant !== "neon-bg" && (
        <>
          <rect width="64" height="64" rx="14.5" fill={`url(#${id}-ambient)`} />
          <rect
            width="64"
            height="64"
            rx="14.5"
            fill="none"
            stroke={`url(#${id}-border)`}
            strokeWidth="0.5"
          />
        </>
      )}

      <g transform="translate(32 31)">
        <path
          d="M-14.8 1h-4.2M-14.8 5.5h-3.2M-14.8 10h-2.5"
          stroke={variant === "neon-bg" ? "#0A0A0B" : "#C8FF00"}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.45"
        />
        <circle
          cx="-11"
          cy="5.5"
          r="5"
          fill={variant === "neon-bg" ? "#0A0A0B" : "#C8FF00"}
          filter={variant !== "neon-bg" ? `url(#${id}-glow)` : undefined}
        />
        <circle
          cx="-12.5"
          cy="4"
          r="0.7"
          fill={variant === "neon-bg" ? "#C8FF00" : "#0A0A0B"}
          opacity="0.65"
        />
        <circle
          cx="-9.5"
          cy="4.8"
          r="0.7"
          fill={variant === "neon-bg" ? "#C8FF00" : "#0A0A0B"}
          opacity="0.65"
        />
        <circle
          cx="-11"
          cy="7"
          r="0.7"
          fill={variant === "neon-bg" ? "#C8FF00" : "#0A0A0B"}
          opacity="0.65"
        />
        <circle
          cx="-8.8"
          cy="7"
          r="0.55"
          fill={variant === "neon-bg" ? "#C8FF00" : "#0A0A0B"}
          opacity="0.45"
        />
        <path
          d="M-2.8 -8.5v28M-2.8 -8.5h10.2c3.8 0 6.5 2.2 6.5 5.8s-2.7 5.8-6.5 5.8h-5c3.8 0 6.5 2.2 6.5 5.8s-2.7 5.8-6.5 5.8H-2.8"
          stroke={variant === "neon-bg" ? "#0A0A0B" : `url(#${id}-neon)`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={variant !== "neon-bg" ? `url(#${id}-glow)` : undefined}
        />
      </g>
    </svg>
  );
}
