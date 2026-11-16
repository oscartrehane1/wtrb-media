import { isThumbnailFilename } from "./blob-media-resolver.ts";

type ThumbnailStore = {
  metadata: (pathname: string) => Promise<{ size: number; contentType: string; etag: string } | null>;
  read: (pathname: string) => Promise<{ stream: ReadableStream<Uint8Array> | null } | null>;
};

/** Only the approved thumbnail names are published; no arbitrary store paths. */
export async function servePrivateThumbnail(request: Request, filename: string, store: ThumbnailStore) {
  if (!isThumbnailFilename(filename)) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  return streamApprovedThumbnail(request, filename, store);
}

/** Caller must validate the name and authorise publication before calling. */
export async function streamApprovedThumbnail(request: Request, filename: string, store: ThumbnailStore) {
  const headers = new Headers({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  try {
    const metadata = await store.metadata(filename);
    if (!metadata) return new Response(null, { status: 404, headers });
    const expectedType = filename.endsWith(".webp") ? "image/webp" : "image/jpeg";
    const type = metadata.contentType.split(";")[0].trim().toLowerCase();
    // Some image exporters retain PNG bytes when the upload is named .jpg.
    // Permit only this raster exception, never arbitrary MIME types or SVG.
    const pngAlias = expectedType === "image/jpeg" && type === "image/png";
    if (type !== expectedType && !pngAlias) return new Response(null, { status: 415, headers });
    if (metadata.size > 8 * 1024 * 1024) return new Response(null, { status: 413, headers });
    headers.set("Content-Type", type);
    headers.set("ETag", metadata.etag);
    if (request.method === "HEAD") return new Response(null, { headers });
    const result = await store.read(filename);
    if (!result?.stream) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    if (pngAlias) {
      const reader = result.stream.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 8 * 1024 * 1024) {
            await reader.cancel();
            return new Response(null, { status: 413, headers });
          }
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      const signature = [137, 80, 78, 71, 13, 10, 26, 10];
      if (!signature.every((byte, index) => bytes[index] === byte)) return new Response(null, { status: 415, headers });
      return new Response(bytes, { headers });
    }
    return new Response(result.stream, { headers });
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
