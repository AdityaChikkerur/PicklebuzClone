import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0B",
          borderRadius: 40,
          border: "4px solid rgba(200,255,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              background: "#C8FF00",
            }}
          />
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              fontStyle: "italic",
              color: "#C8FF00",
            }}
          >
            B
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
