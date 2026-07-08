import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // Render the actual app logo so `/apple-icon` matches the favicon/manifest.
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          role="img"
          aria-label="PickleBuzz"
        >
          <defs>
            <linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8FF66" />
              <stop offset="50%" stopColor="#C8FF00" />
              <stop offset="100%" stopColor="#9ED600" />
            </linearGradient>
          </defs>
          <rect
            width="512"
            height="512"
            rx="112"
            fill="#0A0A0B"
            stroke="rgba(200,255,0,0.15)"
            strokeWidth="4"
          />
          <path
            d="M112 224h-48M112 256h-40M112 288h-32"
            stroke="#C8FF00"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.6"
          />
          <circle cx="144" cy="256" r="56" fill="#C8FF00" />
          <circle cx="128" cy="240" r="8" fill="#0A0A0B" opacity="0.7" />
          <circle cx="160" cy="248" r="8" fill="#0A0A0B" opacity="0.7" />
          <circle cx="144" cy="272" r="8" fill="#0A0A0B" opacity="0.7" />
          <circle cx="168" cy="272" r="6" fill="#0A0A0B" opacity="0.5" />
          <path
            d="M208 128v256M208 128h112c48 0 80 24 80 64s-32 64-80 64h-48c48 0 80 24 80 64s-32 64-80 64H208"
            stroke="url(#neon)"
            strokeWidth="40"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M208 384L160 448L192 384" fill="#C8FF00" opacity="0.9" />
          <path
            d="M384 112l24-32M416 144l32-16M400 176l40 8"
            stroke="#FFFFFF"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M304 416l32 24-24 8 16 32-40-32 24-8-24-24z"
            fill="#C8FF00"
            opacity="0.85"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
