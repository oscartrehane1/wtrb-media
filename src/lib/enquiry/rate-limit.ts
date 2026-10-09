import { createHash } from "node:crypto";

type RateLimitResult = { allowed: boolean; configured: boolean };
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
  if (!endpoint || !token) return { allowed: true, configured: false };
  if (!salt) return { allowed: false, configured: true };

  const key = `enquiry:${createHash("sha256").update(`${salt}:${identifier}`).digest("hex")}`;
  try {
    const response = await fetcher(`${endpoint}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, 3600, "NX"]]),
      cache: "no-store",
    });
    if (!response.ok) return { allowed: false, configured: true };
    const results = await response.json() as Array<{ result?: number }>;
    return { allowed: (results[0]?.result ?? 999) <= 5, configured: true };
  } catch {
    return { allowed: false, configured: true };
  }
}
