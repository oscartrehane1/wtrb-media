import { isThumbnailFilename } from "./blob-media-resolver.ts";

type ThumbnailStore = {
  metadata: (pathname: string) => Promise<{ size: number; contentType: string; etag: string } | null>;
  read: (pathname: string) => Promise<{ stream: ReadableStream<Uint8Array> | null } | null>;
};

/** Only the approved thumbnail names are published; no arbitrary store paths. */
export async function servePrivateThumbnail(request: Request, filename: string, store: ThumbnailStore) {
  const headers = new Headers({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  if (!isThumbnailFilename(filename)) return new Response(null, { status: 404, headers });
  try {
    const metadata = await store.metadata(filename);
    if (!metadata) return new Response(null, { status: 404, headers });
    const type = filename.endsWith(".webp") ? "image/webp" : "image/jpeg";
    if (metadata.contentType.split(";")[0] !== type) return new Response(null, { status: 415, headers });
    if (metadata.size > 8 * 1024 * 1024) return new Response(null, { status: 413, headers });
    headers.set("Content-Type", type);
    headers.set("ETag", metadata.etag);
    if (request.method === "HEAD") return new Response(null, { headers });
    const result = await store.read(filename);
    if (!result?.stream) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    return new Response(result.stream, { headers });
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
