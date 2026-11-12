import assert from "node:assert/strict";
import test from "node:test";
import { servePrivateThumbnail } from "./private-thumbnail.ts";

const request = (method = "GET") => new Request("https://example.com/api/thumbnails/work-01.jpg", { method });
const store = () => ({
  metadata: async () => ({ size: 3, contentType: "image/jpeg", etag: "image-version" }),
  read: async () => ({ stream: new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array([255, 216, 255])); controller.close(); } }) }),
});

test("private thumbnail streams preserve image headers without browser cache or credentials", async () => {
  const response = await servePrivateThumbnail(request(), "work-01.jpg", store());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "image/jpeg");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [255, 216, 255]);
});

test("unapproved thumbnail paths cannot access storage", async () => {
  const forbidden = { metadata: async () => { throw new Error("must not read"); }, read: store().read };
  for (const path of ["secret.jpg", "../work-01.jpg", "work-01.svg", "work-05.jpg", "hero-desktop.jpg"]) {
    assert.equal((await servePrivateThumbnail(request(), path, forbidden)).status, 404);
  }
});

test("HEAD doesn't fetch image bytes; missing images return 404", async () => {
  const headStore = { ...store(), read: async () => { throw new Error("must not download"); } };
  assert.equal((await servePrivateThumbnail(request("HEAD"), "work-01.jpg", headStore)).status, 200);
  assert.equal((await servePrivateThumbnail(request(), "work-01.jpg", { ...store(), metadata: async () => null })).status, 404);
});

test("rejects incorrect types and oversized images; provider failures remain generic", async () => {
  assert.equal((await servePrivateThumbnail(request(), "work-01.webp", store())).status, 415);
  assert.equal((await servePrivateThumbnail(request(), "work-01.jpg", { ...store(), metadata: async () => ({ size: 9 * 1024 * 1024, contentType: "image/jpeg", etag: "large" }) })).status, 413);
  const failed = await servePrivateThumbnail(request(), "work-01.jpg", { ...store(), read: async () => { throw new Error("secret provider detail"); } });
  assert.equal(failed.status, 503);
  assert.equal(await failed.text(), "");
});
