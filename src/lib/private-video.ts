import { isVideoFilename } from "./blob-media-resolver.ts";

type VideoMetadata = { size: number; contentType: string; etag: string };
type VideoBody = { stream: ReadableStream<Uint8Array> | null; headers: { get(name: string): string | null } };
type VideoStore = {
  metadata: (pathname: string) => Promise<VideoMetadata | null>;
  read: (pathname: string, range?: string) => Promise<VideoBody | null>;
};

/** Approved filenames intentionally publish website videos; all other paths stay private. */
export async function servePrivateVideo(request: Request, filename: string, store: VideoStore) {
  if (!isVideoFilename(filename)) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  return streamApprovedVideo(request, filename, store);
}

/** Caller must validate the name and authorise publication before calling. */
export async function streamApprovedVideo(request: Request, filename: string, store: VideoStore) {
  const headers = new Headers({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  try {
    const metadata = await store.metadata(filename);
    if (!metadata) return new Response(null, { status: 404, headers });
    headers.set("Content-Type", filename.endsWith(".mp4") ? "video/mp4" : "video/webm");
    headers.set("Accept-Ranges", "bytes");
    headers.set("ETag", metadata.etag);
    headers.set("Content-Length", String(metadata.size));
    if (request.method === "HEAD") return new Response(null, { headers });

    let range: string | undefined;
    let status = 200;
    const requested = request.headers.get("range");
    // A mismatched If-Range means return the current full representation.
    if (requested && (!request.headers.get("if-range") || request.headers.get("if-range") === metadata.etag)) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(requested);
      const start = match?.[1] ? Number(match[1]) : Math.max(0, metadata.size - Number(match?.[2]));
      const end = match?.[1] && match[2] ? Math.min(Number(match[2]), metadata.size - 1) : metadata.size - 1;
      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || start >= metadata.size) {
        headers.delete("Content-Length");
        headers.set("Content-Range", `bytes */${metadata.size}`);
        return new Response(null, { status: 416, headers });
      }
      range = `bytes=${start}-${end}`;
      headers.set("Content-Range", `bytes ${start}-${end}/${metadata.size}`);
      headers.set("Content-Length", String(end - start + 1));
      status = 206;
    }

    const body = await store.read(filename, range);
    if (!body?.stream) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    // Never label a full upstream body as a partial response if Range was ignored.
    if (range && !body.headers.get("content-range")) {
      headers.delete("Content-Range");
      headers.set("Content-Length", String(metadata.size));
      status = 200;
    }
    // Keep the upstream length/ETag authoritative if a replacement raced metadata.
    for (const name of ["content-length", "content-range", "etag"]) {
      const value = body.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(body.stream, { status, headers });
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
