import assert from "node:assert/strict";
import test from "node:test";
import { caseStudies } from "../content/case-studies.ts";
import { portfolioProjects } from "../content/portfolio.ts";
import { readBlobMedia, isThumbnailFilename, isVideoFilename, type VideoBlob } from "./blob-media-resolver.ts";
import { resolveCaseStudyMedia } from "./case-study-media-resolver.ts";
import { servePrivateThumbnail } from "./private-thumbnail.ts";
import { servePrivateVideo } from "./private-video.ts";

const study = { ...caseStudies[0], homepageLandscapeConfirmed: false };
function blob(pathname: string, etag = "original", date = "2026-01-01"): VideoBlob {
  return { pathname, url: `https://example.private.blob.vercel-storage.com/${pathname}`, uploadedAt: new Date(date), etag };
}
const discover = (files: VideoBlob[]) => readBlobMedia(async () => ({ blobs: files, hasMore: false }), true);
const resolve = async (...names: string[]) => resolveCaseStudyMedia(study, await discover(names.map((name) => blob(name))), portfolioProjects[0]);

test("landscape-only case study renders no other media categories", async () => {
  const result = await resolve("work-01-landscape.mp4", "work-01-landscape.webp");
  assert.equal(result.landscape?.aspectRatio, "16:9");
  assert.match(result.landscape!.video!.src, /^\/api\/media\/work-01-landscape.mp4\?v=/);
  assert.match(result.landscape!.poster!, /^\/api\/thumbnails\/work-01-landscape.webp\?v=/);
  assert.deepEqual(result.vertical, []);
  assert.deepEqual(result.photography, []);
});

test("vertical-only case study has no phantom landscape or development player", async () => {
  const result = await resolve("work-01-vertical-01.webm", "work-01-vertical-01.jpg", "work-01.mp4");
  assert.equal(result.landscape, null);
  assert.equal(result.vertical.length, 1);
  assert.equal(result.vertical[0].aspectRatio, "9:16");
  assert.ok(result.vertical[0].poster);
});

test("photography-only projects ignore orphan video posters", async () => {
  const result = await resolve("work-01-photo-01.jpg", "work-01-vertical-01.jpg", "work-01-landscape.webp");
  assert.equal(result.landscape, null);
  assert.deepEqual(result.vertical, []);
  assert.equal(result.photography.length, 1);
  assert.equal(result.photography[0].alt, `${study.title} — photograph 1`);
});

test("mixed media sorts numerically beyond three assets and keeps projects isolated", async () => {
  const names = ["work-01-landscape.mp4", ...[100, 11, 2, 1, 4].flatMap((n) => [`work-01-vertical-${String(n).padStart(2, "0")}.mp4`, `work-01-photo-${String(n).padStart(2, "0")}.webp`]), "work-02-photo-01.jpg"];
  const assets = await discover(names.map((name) => blob(name)));
  const result = resolveCaseStudyMedia(study, assets);
  assert.ok(result.landscape);
  assert.deepEqual(result.vertical.map((film) => film.label), ["Vertical film 01", "Vertical film 02", "Vertical film 04", "Vertical film 11", "Vertical film 100"]);
  assert.equal(result.photography.length, 5);
  const other = resolveCaseStudyMedia({ ...study, mediaSlot: "work-02" }, assets);
  assert.equal(other.landscape, null);
  assert.equal(other.photography.length, 1);
});

test("homepage reuse needs explicit orientation confirmation; dedicated landscape takes priority", async () => {
  const assets = await discover([blob("work-01.mp4"), blob("work-01.jpg")]);
  const confirmed = { ...study, homepageLandscapeConfirmed: true };
  assert.equal(resolveCaseStudyMedia({ ...study, homepageLandscapeConfirmed: false }, assets, portfolioProjects[0]).landscape, null);
  assert.match(resolveCaseStudyMedia(confirmed, assets, portfolioProjects[0]).landscape!.video!.src, /work-01.mp4/);
  for (const aspectRatio of ["9:16", "4:5", "1:1"] as const) {
    assert.equal(resolveCaseStudyMedia(confirmed, assets, { ...portfolioProjects[0], aspectRatio }).landscape, null);
  }
  const dedicated = await discover([blob("work-01.mp4"), blob("work-01-landscape.webm")]);
  assert.match(resolveCaseStudyMedia(confirmed, dedicated, portfolioProjects[0]).landscape!.video!.src, /work-01-landscape.webm/);
  assert.ok(dedicated.videos["work-01"]); // Homepage mapping is not replaced.
});

test("Oslo reuses the dimension-verified existing homepage film without a duplicate upload", async () => {
  assert.equal(caseStudies[0].homepageLandscapeConfirmed, true);
  const assets = await discover([blob("work-01.mp4"), blob("work-01.jpg")]);
  const result = resolveCaseStudyMedia(caseStudies[0], assets, portfolioProjects[0]);
  assert.equal(result.landscape?.video?.src, assets.videos["work-01"].src);
  assert.equal(result.landscape?.poster, assets.thumbnails["work-01"]);
});

test("replacement versions and deletion/rename clear case assets without changing metadata", async () => {
  const before = JSON.stringify(study);
  const first = resolveCaseStudyMedia(study, await discover([blob("work-01-photo-01.jpg"), blob("work-01-vertical-01.mp4")]));
  const changed = resolveCaseStudyMedia(study, await discover([blob("work-01-photo-01.jpg", "new", "2026-02-01")]));
  assert.notEqual(first.photography[0].src, changed.photography[0].src);
  assert.equal(changed.vertical.length, 0);
  const removed = await resolve("archive-work-01-photo-01.jpg", "work-01-photo-01-random.jpg", "work-01-vertical-01-old.mp4");
  assert.deepEqual(removed, { landscape: null, vertical: [], photography: [] });
  assert.equal(JSON.stringify(study), before);
});

test("format and duplicate precedence are deterministic across pagination", async () => {
  const files = [blob("work-01-vertical-01.webm"), blob("work-01-vertical-01.mp4"), blob("work-01-photo-01.jpg"), blob("work-01-photo-01.webp"), blob("work-01-photo-01.webp", "latest", "2026-02-01")];
  for (const order of [files, [...files].reverse()]) {
    const result = await readBlobMedia(async ({ cursor }) => ({ blobs: cursor ? order.slice(2) : order.slice(0, 2), hasMore: !cursor, cursor: cursor ? undefined : "next" }), true);
    assert.equal(result.videos["work-01-vertical-01"].type, "video/mp4");
    assert.match(result.thumbnails["work-01-photo-01"], /\.webp\?v=latest/);
  }
});

test("discovery has a hard request budget and never publishes an incomplete set", async () => {
  let calls = 0;
  const result = await readBlobMedia(async () => ({ blobs: [blob("work-01-photo-01.jpg")], hasMore: true, cursor: String(++calls) }), true);
  assert.equal(calls, 10);
  assert.deepEqual(result, { videos: {}, thumbnails: {} });
});

test("canonical names bound publication; malformed paths cannot read private storage", () => {
  for (const name of ["work-01-vertical-00.mp4", "work-01-vertical-001.mp4", "work-01-vertical-1000.mp4", "work-01-photo-01.mp4", "work-05-landscape.mp4", "folder/work-01-landscape.mp4", "../work-01-photo-01.jpg"]) {
    assert.equal(isVideoFilename(name), false);
    assert.equal(isThumbnailFilename(name), false);
  }
  assert.equal(isVideoFilename("work-04-vertical-999.webm"), true);
  assert.equal(isThumbnailFilename("work-04-photo-999.webp"), true);
});

test("configured film, photography descriptions and consent-aware YouTube fallbacks are preserved", async () => {
  const local = { ...study, media: { ...study.media, youtubeVideoId: "fixture-id", photography: [{ id: "local", src: "/media/local.jpg", alt: "Authored description", caption: "Authored caption", width: 1200, height: 800 }] } };
  const fallback = resolveCaseStudyMedia(local, { videos: {}, thumbnails: {} });
  assert.equal(fallback.landscape?.youtubeVideoId, "fixture-id");
  assert.equal(fallback.photography[0].alt, "Authored description");
  const uploaded = resolveCaseStudyMedia({ ...local, media: { ...local.media, photoDescriptions: { "work-01-photo-01": { alt: "Approved image description", caption: "Approved caption" } } } }, await discover([blob("work-01-landscape.mp4"), blob("work-01-photo-01.jpg")]));
  assert.equal(uploaded.landscape?.youtubeVideoId, undefined);
  assert.equal(uploaded.photography[0].alt, "Approved image description");
  assert.equal(uploaded.photography[0].caption, "Approved caption");
});

test("new private media names use existing streaming, HEAD and no-store delivery", async () => {
  const request = new Request("https://example.com/", { method: "HEAD" });
  const metadata = async () => ({ size: 300, contentType: "image/jpeg", etag: "fixture" });
  const read = async () => { throw new Error("HEAD must not read bytes"); };
  const photo = await servePrivateThumbnail(request, "work-01-photo-01.jpg", { metadata, read });
  const poster = await servePrivateThumbnail(request, "work-01-vertical-01.jpg", { metadata, read });
  const video = await servePrivateVideo(request, "work-01-vertical-01.webm", { metadata, read });
  for (const response of [photo, poster, video]) {
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  assert.equal(video.headers.get("accept-ranges"), "bytes");
});
