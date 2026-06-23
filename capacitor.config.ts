import type { CapacitorConfig } from "@capacitor/cli";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

/** Load .env.local so `cap sync` picks up CAPACITOR_SERVER_URL without extra shell setup. */
function loadEnvLocal() {
  const envPath = join(__dirname, ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

function resolveServerUrl(): string | undefined {
  const url =
    process.env.CAPACITOR_SERVER_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!url) return undefined;
  // localhost only works on emulator — not a physical phone
  if (url.includes("localhost") || url.includes("127.0.0.1")) return undefined;
  return url.replace(/\/$/, "");
}

const serverUrl = resolveServerUrl();
const useCleartext = serverUrl?.startsWith("http://") ?? false;

const config: CapacitorConfig = {
  appId: "com.picklebuzz.app",
  appName: "PickleBuzz",
  webDir: "public",
  android: {
    allowMixedContent: useCleartext,
  },
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: useCleartext,
          androidScheme: useCleartext ? "http" : "https",
        },
      }
    : {}),
};

export default config;
