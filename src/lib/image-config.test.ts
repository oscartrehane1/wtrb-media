import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import config from "../../next.config.ts";

const { hasLocalMatch } = createRequire(import.meta.url)("next/dist/shared/lib/match-local-pattern.js");

test("Next image configuration accepts versioned private thumbnails without opening arbitrary query paths", () => {
  const patterns = config.images?.localPatterns;
  for (const slot of ["showreel", "work-01", "work-02", "work-03", "work-04"]) {
    for (const extension of ["jpg", "webp"]) {
      assert.equal(hasLocalMatch(patterns, `/api/thumbnails/${slot}.${extension}?v=%22etag%22-1794479847000`), true);
    }
  }
  assert.equal(hasLocalMatch(patterns, "/media/posters/local.jpg"), true);
  assert.equal(hasLocalMatch(patterns, "/api/thumbnails/work-01-photo-100.webp?v=replacement"), true);
  assert.equal(hasLocalMatch(patterns, "/api/thumbnails/work-04-vertical-99.jpg?v=replacement"), true);
  assert.equal(hasLocalMatch(patterns, "/api/thumbnails/work-05-photo-01.jpg?v=1"), false);
  for (const path of ["/api/thumbnails/secret.jpg?v=1", "/api/thumbnails/work-01.svg?v=1", "/api/media/work-01.mp4?v=1", "/other.jpg?v=1"]) {
    assert.equal(hasLocalMatch(patterns, path), false);
  }
});
