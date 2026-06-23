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
  return "192.168.0.105";
}

const env = loadEnvLocal();
const url =
  process.env.CAPACITOR_SERVER_URL?.trim() ||
  env.CAPACITOR_SERVER_URL?.trim() ||
  `http://${detectLanIp()}:3000`;

const normalized = url.replace(/\/$/, "");
const outPath = join(root, "public", "capacitor-server.json");
writeFileSync(outPath, JSON.stringify({ url: normalized }, null, 2) + "\n");
console.log(`Capacitor server URL: ${normalized}`);
