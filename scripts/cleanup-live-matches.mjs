/**
 * One-off: list and delete all live matches (abandoned demo sessions).
 * Usage: node scripts/cleanup-live-matches.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function rest(path, options = {}) {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers, ...options });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? text ?? res.statusText);
  }
  return data;
}

const liveMatches = await rest(
  "matches?select=id,team_a_name,team_b_name,venue,city,status,created_at,is_public&status=eq.live&order=created_at.desc"
);

if (!liveMatches?.length) {
  console.log("No live matches found — database is already clean.");
  process.exit(0);
}

console.log(`Found ${liveMatches.length} live match(es):`);
for (const m of liveMatches) {
  console.log(
    `  - ${m.id} | ${m.team_a_name} vs ${m.team_b_name} @ ${m.venue ?? "—"}, ${m.city ?? "—"} (${m.created_at})`
  );
}

for (const m of liveMatches) {
  const id = m.id;
  for (const link of [
    `/live-scoring/${id}`,
    `/match-invite/${id}`,
    `/match/${id}`,
    `/spectate/${id}`,
  ]) {
    await rest(`notifications?link=eq.${encodeURIComponent(link)}`, {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=minimal" },
    }).catch(() => {});
  }
}

const deleted = await rest("matches?status=eq.live", {
  method: "DELETE",
});

console.log(`Deleted ${deleted?.length ?? liveMatches.length} live match(es).`);

const remaining = await rest("matches?select=id&status=eq.live");
console.log(`Remaining live matches: ${remaining?.length ?? 0}.`);
