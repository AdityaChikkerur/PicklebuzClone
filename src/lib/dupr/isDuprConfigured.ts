export function isDuprConfigured(): boolean {
  const key = process.env.DUPR_API_KEY;
  if (!key) return false;
  return key !== "your-dupr-api-key";
}
