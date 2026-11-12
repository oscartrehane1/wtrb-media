import assert from "node:assert/strict";
import test from "node:test";
import { matchBlobVideo, readBlobMedia, readBlobVideos, type VideoBlob } from "./blob-media-resolver.ts";

const source = "https://example.public.blob.vercel-storage.com/work-02.mp4";

test("private thumbnails are versioned same-origin URLs; WebP wins independently of listing order", async () => {
  const jpg = { ...blob("work-01.jpg"), url: "https://example.private.blob.vercel-storage.com/work-01.jpg" };
  const webp = { ...blob("work-01.webp"), url: "https://example.private.blob.vercel-storage.com/work-01.webp" };
  for (const blobs of [[jpg, webp], [webp, jpg]]) {
    const result = await readBlobMedia(async () => ({ blobs, hasMore: false }), true);
    assert.match(result.thumbnails["work-01"], /^\/api\/thumbnails\/work-01\.webp\?v=/);
    assert.doesNotMatch(result.thumbnails["work-01"], /private\.blob/);
    assert.deepEqual(result.videos, {});
  }
});

test("thumbnail replacement, deletion and rename refresh independently of video slots", async () => {
  const load = (blobs: VideoBlob[]) => readBlobMedia(async () => ({ blobs: [blob("work-01.mp4"), ...blobs], hasMore: false }), true);
  const original = await load([blob("work-01.jpg")]);
  const replacement = await load([blob("work-01.jpg", "replacement")]);
  assert.notEqual(original.thumbnails["work-01"], replacement.thumbnails["work-01"]);
  for (const blobs of [[], [blob("archived-work-01.jpg"), blob("work-01-random.jpg"), blob("images/work-01.jpg"), blob("work-05.webp"), blob("hero-desktop.jpg")]]) {
    const result = await load(blobs);
    assert.deepEqual(result.thumbnails, {});
    assert.ok(result.videos["work-01"]);
  }
  assert.ok((await load([blob("showreel.jpg")])).thumbnails.showreel);
});

test("failed image listings never retain a partial thumbnail map", async () => {
  const result = await readBlobMedia(async ({ cursor }) => {
    if (cursor) throw new Error("provider details");
    return { blobs: [blob("work-01.jpg")], hasMore: true, cursor: "next" };
  }, true);
  assert.deepEqual(result, { videos: {}, thumbnails: {} });
});

function blob(pathname: string, etag = "version-1", uploadedAt = new Date("2026-01-01")): VideoBlob {
  return { pathname, url: `https://example.public.blob.vercel-storage.com/${pathname}`, etag, uploadedAt };
}

test("connected stores can resolve without an explicit token; unconfigured builds make no request", async () => {
  let calls = 0;
  const listPage = async () => { calls++; return { blobs: [blob("hero-desktop.mp4")], hasMore: false }; };
  assert.deepEqual(await readBlobVideos(listPage, false), {});
  assert.equal(calls, 0);
  assert.ok((await readBlobVideos(listPage, true))["hero-desktop"]);
});

test("paginates completely, chooses MP4 consistently, and versions replacement URLs", async () => {
  const pages = [
    { blobs: [blob("work-02.webm"), blob("work-02.mp4")], hasMore: true, cursor: "next" },
    { blobs: [blob("work-02.mp4", "version-2", new Date("2026-02-01"))], hasMore: false },
  ];
  const cursors: Array<string | undefined> = [];
  const resolved = await readBlobVideos(async ({ cursor }) => {
    cursors.push(cursor);
    return pages[cursor ? 1 : 0];
  }, true);
  assert.deepEqual(cursors, [undefined, "next"]);
  assert.equal(resolved["work-02"].type, "video/mp4");
  assert.match(resolved["work-02"].src, /v=version-2/);
  const original = await readBlobVideos(async () => ({ blobs: [blob("work-02.mp4")], hasMore: false }), true);
  assert.notEqual(original["work-02"].src, resolved["work-02"].src);
});

test("successful deletion or rename clears its slot on the next lookup", async () => {
  const load = (blobs: VideoBlob[]) => readBlobVideos(async () => ({ blobs, hasMore: false }), true);
  assert.ok((await load([blob("work-01.mp4")]))["work-01"]);
  assert.deepEqual(await load([blob("archived-work-01.mp4")]), {});
  assert.deepEqual(await load([]), {});
  const webmFallback = await load([blob("work-01.webm")]);
  assert.equal(webmFallback["work-01"].type, "video/webm");
});

test("format priority is independent of listing order and upload age", async () => {
  const mp4 = blob("work-03.mp4");
  const webm = blob("work-03.webm", "new-webm", new Date("2026-03-01"));
  for (const blobs of [[mp4, webm], [webm, mp4]]) {
    const result = await readBlobVideos(async () => ({ blobs, hasMore: false }), true);
    assert.equal(result["work-03"].type, "video/mp4");
  }
});

test("same bytes uploaded again receive a fresh browser cache key", async () => {
  const resolve = (uploadedAt: Date) => readBlobVideos(async () => ({ blobs: [blob("showreel.mp4", "same-content", uploadedAt)], hasMore: false }), true);
  const first = await resolve(new Date("2026-01-01"));
  const replacement = await resolve(new Date("2026-02-01"));
  assert.notEqual(first.showreel.src, replacement.showreel.src);
});

test("partial failures and malformed pagination return fallbacks, never partial stale slots", async () => {
  let warnings = 0;
  const result = await readBlobVideos(async ({ cursor }) => {
    if (cursor) throw new Error("private provider failure detail");
    return { blobs: [blob("showreel.mp4")], hasMore: true, cursor: "next" };
  }, true, () => warnings++);
  assert.deepEqual(result, {});
  assert.equal(warnings, 1);
  assert.deepEqual(await readBlobVideos(async () => ({ blobs: [], hasMore: true }), true), {});
});

test("matches supported exact slot names and video formats", () => {
  assert.equal(matchBlobVideo("work-02.mp4", source)?.slot, "work-02");
  assert.equal(matchBlobVideo("hero-mobile.webm", source)?.video.type, "video/webm");
});

test("renamed, nested, suffixed and unsupported files no longer occupy a slot", () => {
  for (const path of ["old-work-02.mp4", "videos/work-02.mp4", "work-02-random.mp4", "work-05.mp4", "work-02.mov"]) {
    assert.equal(matchBlobVideo(path, source), null);
  }
});

test("private videos resolve to the restricted website streaming route", async () => {
  const privateUrl = "https://example.private.blob.vercel-storage.com/work-01.mp4";
  assert.equal(matchBlobVideo("work-01.mp4", privateUrl)?.video.src, "/api/media/work-01.mp4");
  const videos = await readBlobVideos(async () => ({ blobs: [{ ...blob("work-01.mp4"), url: privateUrl }], hasMore: false }), true);
  assert.match(videos["work-01"].src, /^\/api\/media\/work-01\.mp4\?v=/);
  assert.doesNotMatch(videos["work-01"].src, /private\.blob/);
});

test("rejects invalid and non-Blob media URLs", () => {
  for (const url of ["invalid", "https://example.com/a.mp4", "http://example.public.blob.vercel-storage.com/a.mp4"]) {
    assert.equal(matchBlobVideo("work-02.mp4", url), null);
  }
});
