import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/utils";

export const alt = `${APP_NAME} — India's pickleball scoring & tournament app`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #0A0A0B 0%, #141416 50%, #0A0A0B 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              background: "#C8FF00",
            }}
          />
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              fontStyle: "italic",
              color: "#FFFFFF",
            }}
          >
            {APP_NAME}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              fontStyle: "italic",
              color: "#C8FF00",
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            India&apos;s #1 Pickleball Scoring App
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
            Live scores · Tournaments · Rankings · Club bookings
          </div>
        </div>
        <div style={{ fontSize: 22, color: "rgba(200,255,0,0.8)" }}>
          picklebuzz.in
        </div>
      </div>
    ),
    { ...size }
  );
}
