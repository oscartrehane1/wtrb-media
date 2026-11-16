import assert from "node:assert/strict";
import test from "node:test";
import { discoverProjects, orderProjects, readManifest, type ProjectStore } from "./project-discovery.ts";
import { manifestLimit, osloSlug, parseProjectManifest, type ProjectManifest } from "./project-manifest.ts";
import { manifestToStudy, projectCard, projectMedia } from "./project-presentation.ts";
import { serveProjectMedia } from "./project-media.ts";

const fixture = (slug: string, changes: Partial<ProjectManifest> = {}): ProjectManifest => ({
  slug, title: "Example title", subtitle: "Example subtitle", sector: "Tourism", projectType: "Destination campaign",
  status: "independent", summary: "Example summary", campaignObjective: "Example objective", targetAudience: "Example audience",
  creativeStrategy: "Example strategy", deliverables: ["Example film"], displayOrder: 10, featured: false,
  publicationStatus: "published", ...changes,
});
const bytes = (value: Uint8Array) => new ReadableStream<Uint8Array>({ start(c) { c.enqueue(value); c.close(); } });
function fakeStore() {
  const objects = new Map<string, { data?: unknown; version: string }>();
  const put = (slug: string, name: string, version = "1", data?: unknown) => objects.set(`projects/${slug}/${name}`, { data, version });
  const store: ProjectStore = {
    list: async ({ prefix, cursor }) => {
      const entries = [...objects].filter(([pathname]) => pathname.startsWith(prefix));
      const offset = Number(cursor ?? 0);
      return { blobs: entries.slice(offset, offset + 3).map(([pathname, item]) => ({ pathname, etag: item.version, uploadedAt: new Date(Number(item.version)) })),
        cursor: String(offset + 3), hasMore: offset + 3 < entries.length };
    },
    manifest: async (pathname) => {
      if (!objects.has(pathname)) return null;
      const raw = new TextEncoder().encode(JSON.stringify(objects.get(pathname)?.data));
      return { size: raw.length, stream: bytes(raw) };
    },
  };
  return { objects, put, store, manifest: (slug: string, changes?: Partial<ProjectManifest>) => put(slug, "project.json", "1", fixture(slug, changes)) };
}

test("schema rejects unsafe slugs, unknown fields, invalid enum values and unmatched paths", () => {
  const good = fixture("sample");
  assert.deepEqual(parseProjectManifest(good, "sample"), good);
  for (const value of [{ ...good, slug: "../sample" }, { ...good, thumbnail: "https://example.com/example.jpg" },
    { ...good, publicationStatus: true }, { ...good, featured: "true" }, { ...good, displayOrder: -1 },
    { ...good, deliverables: [] }, { ...good, photoAlt: { cover: "Invalid" } }, { ...good, title: "" }]) {
    assert.equal(parseProjectManifest(value, "sample"), null);
  }
  assert.equal(parseProjectManifest(good, "different"), null);
});

test("paginated catalogue hides invalid, draft, orphan and noncanonical projects and sorts featured first", async () => {
  const { put, store, manifest } = fakeStore();
  assert.deepEqual((await discoverProjects(store)).projects, []);
  manifest("single");
  assert.equal((await discoverProjects(store)).projects.length, 1);
  manifest("featured", { featured: true, displayOrder: 999 });
  manifest("early", { displayOrder: 0 });
  manifest("draft", { publicationStatus: "draft" });
  put("draft", "cover.jpg");
  put("invalid", "project.json", "1", fixture("another-slug"));
  put("orphan", "vertical-01.mp4");
  put("INVALID", "project.json", "1", fixture("INVALID"));
  const catalogue = await discoverProjects(store);
  assert.equal(catalogue.legacyOslo, true);
  assert.deepEqual(orderProjects(catalogue.projects.map(({ manifest }) => manifest)).map(({ slug }) => slug), ["featured", "early", "single"]);
  manifest(osloSlug, { publicationStatus: "draft" });
  const withDraftOslo = await discoverProjects(store);
  assert.equal(withDraftOslo.legacyOslo, false);
  assert.ok(!withDraftOslo.projects.some(({ manifest }) => manifest.slug === osloSlug));
});

test("resolve landscape, vertical, photography and mixed projects without phantom categories", async () => {
  const { put, store, manifest } = fakeStore();
  const cases = {
    landscape: ["landscape-01.mp4", "landscape-01.webp", "landscape-02.webm"],
    vertical: ["vertical-10.webm", "vertical-02.mp4", "vertical-02.jpg"],
    photography: ["photo-02.jpg", "photo-02.webp", "photo-03.jpg"],
    mixed: ["landscape-01.mp4", "vertical-01.mp4", "photo-01.jpg", "cover.jpg"],
    empty: ["vertical-01.jpg", "arbitrary.mp4"],
  };
  for (const [slug, names] of Object.entries(cases)) {
    manifest(slug, { photoAlt: { "photo-02": "Descriptive alt text" } });
    names.forEach((name) => put(slug, name));
  }
  const { projects } = await discoverProjects(store);
  for (const project of projects) {
    const { slug } = project.manifest;
    const media = projectMedia(project);
    assert.equal(Boolean(media.landscape), ["landscape", "mixed"].includes(slug));
    assert.equal(Boolean(media.vertical.length), ["vertical", "mixed"].includes(slug));
    assert.equal(Boolean(media.photography.length), ["photography", "mixed"].includes(slug));
    const card = projectCard(project, media);
    if (slug === "landscape") {
      assert.equal(media.additionalLandscape?.[0].video?.type, "video/webm");
      assert.match(media.landscape!.poster!, /landscape-01.webp/);
    }
    if (slug === "vertical") assert.deepEqual(media.vertical.map(({ id, aspectRatio }) => [id, aspectRatio]), [["vertical-02", "9:16"], ["vertical-10", "9:16"]]);
    if (slug === "photography") {
      assert.equal(card.video, null);
      assert.match(card.poster!, /photo-02.webp/);
      assert.equal(media.photography[0].alt, "Descriptive alt text");
    }
    if (slug === "mixed") assert.match(card.poster!, /cover.jpg/);
    if (slug === "empty") assert.equal(card.poster, null);
    assert.equal(manifestToStudy(project).results, undefined);
  }
});

test("refresh reflects replacement, removal, draft and duplicate formats deterministically", async () => {
  const { put, objects, store, manifest } = fakeStore();
  manifest("sample");
  put("sample", "cover.jpg");
  put("sample", "landscape-01.mp4");
  put("sample", "landscape-01.webm", "2");
  const before = (await discoverProjects(store)).projects[0];
  assert.match(before.videos["landscape-01"], /mp4/);
  put("sample", "cover.jpg", "2");
  objects.delete("projects/sample/landscape-01.mp4");
  const after = (await discoverProjects(store)).projects[0];
  assert.notEqual(after.assets.cover, before.assets.cover);
  assert.match(after.videos["landscape-01"], /webm/);
  objects.delete("projects/sample/project.json");
  assert.equal((await discoverProjects(store)).projects.length, 0);
});

test("bounds pagination and rejects an oversized manifest payload", async () => {
  await assert.rejects(discoverProjects({ list: async () => ({ blobs: [], hasMore: true, cursor: "repeat" }), manifest: async () => null }), /budget/);
  const result = await readManifest({ manifest: async () => ({ size: 1, stream: bytes(new Uint8Array(manifestLimit + 1)) }) }, "sample");
  assert.equal(result.kind, "invalid");
});

test("Oslo has one canonical source across publication, draft, invalid and deletion", async () => {
  const { store, manifest, put, objects } = fakeStore();
  const catalogueSlugs = async () => {
    const result = await discoverProjects(store);
    return [...result.projects.map(({ manifest }) => manifest.slug), ...(result.legacyOslo ? [osloSlug] : [])];
  };
  assert.deepEqual(await catalogueSlugs(), [osloSlug]);
  manifest(osloSlug, { title: "Updated Oslo title" });
  assert.deepEqual(await catalogueSlugs(), [osloSlug]);
  const published = await discoverProjects(store);
  assert.equal(published.legacyOslo, false);
  assert.equal(projectCard(published.projects[0], projectMedia(published.projects[0])).caseStudySlug, osloSlug);
  manifest(osloSlug, { publicationStatus: "draft" });
  assert.deepEqual(await catalogueSlugs(), []);
  assert.equal((await discoverProjects({ ...store, list: async () => ({ blobs: [], hasMore: false }) })).legacyOslo, false);
  put(osloSlug, "project.json", "2", {});
  assert.deepEqual(await catalogueSlugs(), []);
  objects.delete(`projects/${osloSlug}/project.json`);
  assert.deepEqual(await catalogueSlugs(), [osloSlug]);
});

test("media handler rechecks manifest for HEAD and byte ranges; invalid paths cannot reach storage", async () => {
  const { put, manifest, store } = fakeStore();
  manifest("sample");
  let access = 0;
  const deps = {
    manifest: (slug: string) => readManifest(store, slug),
    assetStore: (slug: string, filename: string) => {
      assert.equal(slug, "sample");
      access++;
      return {
        metadata: async () => ({ size: 3, contentType: filename.endsWith(".jpg") ? "image/jpeg" : "video/mp4", etag: "asset" }),
        read: async (_: string, range?: string) => ({ stream: bytes(new Uint8Array([255, 216, 255])), headers: new Headers(range ? { "Content-Range": "bytes 0-2/3" } : {}) }),
      };
    },
  };
  const request = new Request("https://example.com", { headers: { Range: "bytes=0-2" } });
  for (const [slug, filename] of [["../sample", "cover.jpg"], ["sample", "../cover.jpg"], ["sample", "project.json"], ["missing", "cover.jpg"]]) {
    assert.equal((await serveProjectMedia(request, slug, filename, deps)).status, 404);
  }
  assert.equal(access, 0);
  const video = await serveProjectMedia(request, "sample", "vertical-01.mp4", deps);
  assert.equal(video.status, 206);
  assert.equal(video.headers.get("Content-Range"), "bytes 0-2/3");
  assert.equal(video.headers.get("Cache-Control"), "no-store");
  assert.equal((await serveProjectMedia(request, "sample", "cover.jpg", deps)).headers.get("Content-Type"), "image/jpeg");
  put("sample", "project.json", "2", fixture("sample", { publicationStatus: "draft" }));
  for (const method of ["GET", "HEAD"]) assert.equal((await serveProjectMedia(new Request("https://example.com", { method }), "sample", "vertical-01.mp4", deps)).status, 404);
  assert.equal(access, 2);
});
