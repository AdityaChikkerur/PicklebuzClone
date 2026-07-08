/**
 * Verifies Supabase publishable + secret keys before deploy.
 * Usage: node scripts/verify-supabase-keys.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

async function probe(label, url, key) {
  const response = await fetch(
    `${url}/rest/v1/tournaments?select=id&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "User-Agent": "PickleBuzz-Key-Verify/1.0",
      },
    }
  );
  const body = await response.text();
  console.log(`${label}: ${response.status} ${body.slice(0, 120)}`);
  return response.ok;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secret = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

let ok = true;
ok = (await probe("publishable/anon", url, anon)) && ok;
if (secret) {
  ok = (await probe("secret (server)", url, secret)) && ok;
}

process.exit(ok ? 0 : 1);
