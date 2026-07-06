/** Turn Supabase PostgrestError / network errors into user-readable strings. */
export function formatDbError(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Network error — check your internet connection and try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.message === "string" && record.message) {
      const details =
        typeof record.details === "string" && record.details ? ` (${record.details})` : "";
      return `${record.message}${details}`;
    }
  }

  if (typeof error === "string" && error) {
    return error;
  }

  return fallback;
}
