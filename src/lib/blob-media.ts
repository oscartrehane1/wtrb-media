import "server-only";
import { list } from "@vercel/blob";
import { readBlobVideos } from "./blob-media-resolver";

/** Let the SDK resolve and refresh Vercel-managed OIDC; never capture its token. */
export async function getBlobVideos() {
  return readBlobVideos(
    (options) => list(options),
    Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN),
    () => console.warn("Blob media lookup unavailable; using configured media fallbacks."),
  );
}
