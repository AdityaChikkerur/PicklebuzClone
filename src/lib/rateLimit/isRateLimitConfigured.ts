export function isRateLimitConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return false;

  const placeholders = ["your-upstash-redis-url", "your-upstash-redis-token"];
  return !placeholders.includes(url) && !placeholders.includes(token);
}
