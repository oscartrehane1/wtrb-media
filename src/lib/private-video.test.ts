import assert from "node:assert/strict";
import test from "node:test";
import { servePrivateVideo } from "./private-video.ts";

function mockStore() {
  const calls: Array<{ pathname: string; range?: string }> = [];
  return {
    calls,
    metadata: async () => ({ size: 100, contentType: "video/mp4", etag: '"current"' }),
    read: async (pathname: string, range?: string) => {
      calls.push({ pathname, range });
      const headers = new Headers({ "etag": '"current"' });
      if (range) {
        const [start, end] = range.slice(6).split("-").map(Number);
        headers.set("content-range", `bytes ${start}-${end}/100`);
        headers.set("content-length", String(end - start + 1));
      } else headers.set("content-length", "100");
      return { stream: new ReadableStream<Uint8Array>({ start(controller) { controller.close(); } }), headers };
    },
  };
}

test("only approved root video filenames can reach private storage", async () => {
  const store = mockStore();
  for (const filename of ["secrets.txt", "../work-01.mp4", "folder/work-01.mp4", "archived-work-01.mp4", "work-05.mp4"]) {
    const response = await servePrivateVideo(new Request("https://example.com"), filename, {
      ...store, metadata: async () => { throw new Error("Storage must not be touched"); },
    });
    assert.equal(response.status, 404);
  }
  assert.equal(store.calls.length, 0);
});

test("HEAD returns video metadata without downloading or buffering a body", async () => {
  const store = mockStore();
  const response = await servePrivateVideo(new Request("https://example.com", { method: "HEAD" }), "hero-desktop.mp4", store);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-length"), "100");
  assert.equal(response.headers.get("accept-ranges"), "bytes");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.body, null);
  assert.equal(store.calls.length, 0);
});

test("full GET streams video and byte ranges support seeking and suffix requests", async () => {
  const store = mockStore();
  const full = await servePrivateVideo(new Request("https://example.com"), "work-01.mp4", store);
  assert.equal(full.status, 200);
  assert.equal(full.headers.get("content-type"), "video/mp4");
  for (const [range, expected, length] of [["bytes=10-19", "bytes 10-19/100", "10"], ["bytes=90-", "bytes 90-99/100", "10"], ["bytes=-20", "bytes 80-99/100", "20"], ["bytes=90-500", "bytes 90-99/100", "10"]]) {
    const response = await servePrivateVideo(new Request("https://example.com", { headers: { Range: range } }), "work-01.mp4", store);
    assert.equal(response.status, 206);
    assert.equal(response.headers.get("content-range"), expected);
    assert.equal(response.headers.get("content-length"), length);
  }
});

test("invalid or unsatisfiable ranges are rejected before reading video bytes", async () => {
  const store = mockStore();
  for (const range of ["bytes=100-", "bytes=50-20", "bytes=-0", "bytes=-", "bytes=0-5,10-15", "bytes=999999999999999999999999-"]) {
    const response = await servePrivateVideo(new Request("https://example.com", { headers: { Range: range } }), "work-01.mp4", store);
    assert.equal(response.status, 416);
    assert.equal(response.headers.get("content-range"), "bytes */100");
  }
  assert.equal(store.calls.length, 0);
});

test("deleted videos return 404 and storage errors stay generic", async () => {
  const store = mockStore();
  const request = new Request("https://example.com");
  assert.equal((await servePrivateVideo(request, "work-01.mp4", { ...store, metadata: async () => null })).status, 404);
  const failure = await servePrivateVideo(request, "work-01.mp4", { ...store, metadata: async () => { throw new Error("private-token-must-not-leak"); } });
  assert.equal(failure.status, 503);
  assert.equal(await failure.text(), "");
});

test("a replaced video with mismatched If-Range returns the complete current representation", async () => {
  const store = mockStore();
  const response = await servePrivateVideo(new Request("https://example.com", { headers: { Range: "bytes=10-19", "If-Range": '"old-version"' } }), "work-01.mp4", store);
  assert.equal(response.status, 200);
  assert.equal(store.calls[0].range, undefined);
  assert.equal(response.headers.get("content-range"), null);
});

test("an upstream that ignores Range is never advertised as a partial response", async () => {
  const store = mockStore();
  const response = await servePrivateVideo(new Request("https://example.com", { headers: { Range: "bytes=10-19" } }), "work-01.mp4", {
    ...store, read: (pathname) => store.read(pathname),
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-length"), "100");
  assert.equal(response.headers.get("content-range"), null);
});
