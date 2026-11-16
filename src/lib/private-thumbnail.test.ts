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

test("PNG exported under a matching JPG poster filename is served with its real MIME type", async () => {
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  const pngStore = {
    metadata: async () => ({ size: bytes.length, contentType: "image/png", etag: "poster-version" }),
    read: async () => ({ stream: new ReadableStream<Uint8Array>({ start(c) { c.enqueue(bytes.slice(0, 3)); c.enqueue(bytes.slice(3)); c.close(); } }) }),
  };
  const response = await servePrivateThumbnail(request(), "work-01-vertical-01.jpg", pngStore);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "image/png");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
  const head = await servePrivateThumbnail(request("HEAD"), "work-01-vertical-01.jpg", { ...pngStore, read: async () => { throw new Error("HEAD must not download"); } });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("Content-Type"), "image/png");
});

test("PNG alias rejects non-PNG bytes, unsafe MIME types and dishonest size metadata", async () => {
  const pngMetadata = async () => ({ size: 3, contentType: "image/png", etag: "invalid" });
  assert.equal((await servePrivateThumbnail(request(), "work-01-vertical-01.jpg", { ...store(), metadata: pngMetadata })).status, 415);
  for (const contentType of ["image/svg+xml", "text/html", "application/octet-stream"]) {
    assert.equal((await servePrivateThumbnail(request(), "work-01-vertical-01.jpg", { ...store(), metadata: async () => ({ size: 3, contentType, etag: "invalid" }) })).status, 415);
  }
  const oversized = { metadata: pngMetadata, read: async () => ({ stream: new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new Uint8Array(8 * 1024 * 1024 + 1)); c.close(); } }) }) };
  assert.equal((await servePrivateThumbnail(request(), "work-01-vertical-01.jpg", oversized)).status, 413);
});
