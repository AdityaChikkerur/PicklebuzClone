/** Strip formatting and optional India country code for consistent lookup. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
}

/** True when the query is mostly digits (phone search). */
export function looksLikePhone(query: string): boolean {
  const digits = query.replace(/\D/g, "");
  return digits.length >= 6;
}

export function formatPhoneDisplay(phone: string): string {
  const n = normalizePhone(phone);
  if (n.length === 10) {
    return `+91 ${n.slice(0, 5)} ${n.slice(5)}`;
  }
  return phone.trim();
}
