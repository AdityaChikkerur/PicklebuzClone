export const PHONE_ALREADY_REGISTERED_MESSAGE =
  "This phone number is already registered with another account. Sign in with that account or use a different number.";

function duplicatePhoneHint(parts: string): boolean {
  return /phone|idx_profiles_phone|normalize_phone/i.test(parts);
}

function isRawDuplicatePhoneMessage(message: string): boolean {
  return duplicatePhoneHint(message);
}

function isPostgresDuplicatePhone(error: unknown): boolean {
  if (typeof error === "string") {
    return isRawDuplicatePhoneMessage(error);
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as Record<string, unknown>;
  const message = typeof record.message === "string" ? record.message : "";
  const hint = `${message} ${record.details ?? ""} ${record.hint ?? ""}`;

  if (record.code === "23505" && duplicatePhoneHint(hint)) {
    return true;
  }

  return isRawDuplicatePhoneMessage(hint);
}

/** Whether an error (raw or formatted) refers to a duplicate profile phone. */
export function isPhoneDuplicateError(error: unknown): boolean {
  if (typeof error === "string") {
    return (
      error === PHONE_ALREADY_REGISTERED_MESSAGE ||
      isRawDuplicatePhoneMessage(error) ||
      /already (linked|registered)/i.test(error)
    );
  }

  return isPostgresDuplicatePhone(error);
}

/** Turn Supabase PostgrestError / network errors into user-readable strings. */
export function formatDbError(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Network error — check your internet connection and try again.";
  }

  if (isPostgresDuplicatePhone(error)) {
    return PHONE_ALREADY_REGISTERED_MESSAGE;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;

    if (record.code === "23505") {
      return "This record already exists.";
    }

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
