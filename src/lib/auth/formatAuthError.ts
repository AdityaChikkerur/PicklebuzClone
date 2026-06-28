export function formatAuthError(error: unknown, fallback: string): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Network error — check your internet connection and try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
