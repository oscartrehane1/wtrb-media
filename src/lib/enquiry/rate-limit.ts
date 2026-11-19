import { createHash } from "node:crypto";

type RateLimitResult = { allowed: boolean; configured: boolean; unavailable?: true };
type RateLimitEnvironment = {
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  RATE_LIMIT_SALT?: string;
};
type RateLimitOptions = { fetcher?: typeof fetch; environment?: RateLimitEnvironment };

export async function checkRateLimit(identifier: string, options: RateLimitOptions = {}): Promise<RateLimitResult> {
  const environment = options.environment ?? process.env;
  const fetcher = options.fetcher ?? fetch;
  const endpoint = environment.UPSTASH_REDIS_REST_URL;
  const token = environment.UPSTASH_REDIS_REST_TOKEN;
  const salt = environment.RATE_LIMIT_SALT;
  if (!endpoint || !token || !salt) return { allowed: false, configured: Boolean(endpoint && token), unavailable: true };

  const key = `enquiry:${createHash("sha256").update(`${salt}:${identifier}`).digest("hex")}`;
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error("Invalid limiter endpoint");
    const response = await fetcher(`${url.origin}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, 3600, "NX"]]),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Limiter unavailable");
    const results: unknown = await response.json();
    if (!Array.isArray(results) || results.length !== 2 || results.some(item => !item || typeof item !== "object" || item.error) ||
      !Number.isSafeInteger(results[0].result) || results[0].result < 1 || ![0, 1].includes(results[1].result)) throw new Error("Invalid limiter response");
    return { allowed: results[0].result <= 5, configured: true };
  } catch {
    return { allowed: false, configured: true, unavailable: true };
  }
}
