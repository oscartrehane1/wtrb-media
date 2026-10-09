import assert from "node:assert/strict";
import test from "node:test";
import { checkRateLimit } from "./rate-limit.ts";

const environment = {
  UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "test-token",
  RATE_LIMIT_SALT: "test-only-secret-salt",
};

function mockCount(count: number) {
  return (async (_input: URL | RequestInfo, init?: RequestInit) => {
    assert.match(String(init?.body), /INCR/);
    return new Response(JSON.stringify([{ result: count }, { result: 1 }]), { status: 200 });
  }) as typeof fetch;
}

test("allows the first five requests in the serverless window", async () => {
  assert.deepEqual(await checkRateLimit("192.0.2.1", { environment, fetcher: mockCount(5) }), { allowed: true, configured: true });
});

test("rejects requests over the serverless limit", async () => {
  assert.deepEqual(await checkRateLimit("192.0.2.1", { environment, fetcher: mockCount(6) }), { allowed: false, configured: true });
});

test("fails closed when a configured limiter is incomplete or unavailable", async () => {
  assert.deepEqual(await checkRateLimit("192.0.2.1", { environment: { ...environment, RATE_LIMIT_SALT: undefined }, fetcher: mockCount(1) }), { allowed: false, configured: true });
  const failedFetch = (async () => { throw new Error("unavailable"); }) as typeof fetch;
  assert.deepEqual(await checkRateLimit("192.0.2.1", { environment, fetcher: failedFetch }), { allowed: false, configured: true });
});
