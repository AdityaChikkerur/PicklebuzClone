import { existsSync, readFileSync, writeFileSync } from "fs";
import { networkInterfaces } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return env;
}

function detectLanIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

function isPrivateOrLanUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    if (u.hostname.startsWith("192.168.")) return true;
    if (u.hostname.startsWith("10.")) return true;
    if (u.hostname.startsWith("172.")) {
      const second = Number.parseInt(u.hostname.split(".")[1] ?? "", 10);
      if (second >= 16 && second <= 31) return true;
    }
    return false;
  } catch {
    return true;
  }
}

const isDevBuild =
  process.argv.includes("--dev") ||
  process.env.ANDROID_DEV === "1" ||
  process.env.ANDROID_DEV === "true";

const env = loadEnvLocal();
let url =
  process.env.CAPACITOR_SERVER_URL?.trim() ||
  env.CAPACITOR_SERVER_URL?.trim() ||
  env.NEXT_PUBLIC_APP_URL?.trim();

if (!url) {
  if (isDevBuild) {
    const lanIp = detectLanIp();
    if (!lanIp) {
      console.error(
        "Could not detect LAN IP. Set CAPACITOR_SERVER_URL in .env.local for local phone testing."
      );
      process.exit(1);
    }
    url = `http://${lanIp}:3000`;
  } else {
    console.error(
      "CAPACITOR_SERVER_URL is required for production APK builds."
    );
    console.error(
      "Set it to your deployed HTTPS URL in .env.local (e.g. https://pickle-buzz.vercel.app)."
    );
    process.exit(1);
  }
}

if (!isDevBuild) {
  if (isPrivateOrLanUrl(url)) {
    console.error(
      `Production APK cannot use a LAN/private URL: ${url}\n` +
        "Set CAPACITOR_SERVER_URL to your public HTTPS deployment."
    );
    process.exit(1);
  }

  if (!url.startsWith("https://")) {
    console.error(
      "Production APK requires HTTPS. Set CAPACITOR_SERVER_URL=https://your-domain"
    );
    process.exit(1);
  }
}

const normalized = url.replace(/\/$/, "");
const outPath = join(root, "public", "capacitor-server.json");
writeFileSync(outPath, JSON.stringify({ url: normalized }, null, 2) + "\n");
console.log(`Capacitor server URL: ${normalized}`);
