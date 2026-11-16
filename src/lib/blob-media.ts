import "server-only";
import { list } from "@vercel/blob";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { readBlobMedia } from "./blob-media-resolver";

/** Let the SDK resolve and refresh Vercel-managed OIDC; never capture its token. */
const cachedRootMedia = unstable_cache(async () => {
  let failed = false;
  const media = await readBlobMedia((options) => list({ ...options, mode: "folded" }), true, () => { failed = true; });
  if (failed) throw new Error("Root media discovery unavailable");
  return media;
}, ["legacy-root-media-v1"], { revalidate: 60 });

export const getBlobMedia = cache(async () => {
  if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      return await cachedRootMedia();
    } catch {
      console.warn("Blob media lookup unavailable; using configured media fallbacks.");
    }
  }
  return { videos: {}, thumbnails: {} };
});
