/** User-facing message when Supabase rejects disabled legacy JWT keys. */
export function isLegacyApiKeyDisabledError(message: string | undefined): boolean {
  if (!message) return false;
  return message.toLowerCase().includes("legacy api keys are disabled");
}

export function formatSupabaseConnectionError(message: string | undefined): string {
  if (isLegacyApiKeyDisabledError(message)) {
    return "PickleBuzz cannot reach the database — the Supabase publishable API key needs to be updated in production.";
  }
  return message?.trim() || "Could not connect to PickleBuzz servers. Please try again.";
}
