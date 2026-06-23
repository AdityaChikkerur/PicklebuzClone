// Single source of truth for "are we in mock mode or wired to a real Supabase?"
// Mock mode is true when env vars are missing or still the .env.local.example placeholders.

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;

  const placeholders = [
    "https://your-project.supabase.co",
    "your-anon-key",
  ];
  if (placeholders.includes(url) || placeholders.includes(key)) return false;

  return true;
}
