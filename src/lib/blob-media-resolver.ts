import type { MediaSource } from "@/types/media";
import { parseProjectAssetFilename } from "./media-filenames.ts";

export type VideoBlob = { pathname: string; url: string; uploadedAt: Date; etag: string };
type BlobPage = { blobs: VideoBlob[]; hasMore: boolean; cursor?: string };
type ListPage = (options: { cursor?: string; limit: number; abortSignal: AbortSignal }) => Promise<BlobPage>;

export function isVideoFilename(pathname: string) {
  const project = parseProjectAssetFilename(pathname);
  return /^(hero-desktop|hero-mobile|showreel|work-0[1-4])\.(mp4|webm)$/.test(pathname) || Boolean(project && !project.image);
}

export function isThumbnailFilename(pathname: string) {
  return /^(showreel|work-0[1-4])\.(jpg|webp)$/.test(pathname) || Boolean(parseProjectAssetFilename(pathname)?.image);
}

function blobAccess(source: string) {
  try {
    const url = new URL(source);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (url.hostname.endsWith(".public.blob.vercel-storage.com")) return "public";
    if (url.hostname.endsWith(".private.blob.vercel-storage.com")) return "private";
  } catch { /* Invalid source must not publish media. */ }
  return null;
}

function thumbnailSource(blob: VideoBlob) {
  if (!isThumbnailFilename(blob.pathname)) return null;
  const access = blobAccess(blob.url);
  return access === "private" ? `/api/thumbnails/${blob.pathname}` : access === "public" ? blob.url : null;
}

export function matchBlobVideo(pathname: string, source: string): { slot: string; video: MediaSource } | null {
  if (!isVideoFilename(pathname)) return null;
  try {
    const url = new URL(source);
    const publicBlob = url.hostname.endsWith(".public.blob.vercel-storage.com");
    const privateBlob = url.hostname.endsWith(".private.blob.vercel-storage.com");
    if (url.protocol !== "https:" || (!publicBlob && !privateBlob) || url.username || url.password) return null;
    return { slot: pathname.replace(/\.(mp4|webm)$/, ""), video: { src: privateBlob ? `/api/media/${pathname}` : source, type: pathname.endsWith(".mp4") ? "video/mp4" : "video/webm" } };
  } catch {
    return null;
  }
}

/** Resolve a fresh complete listing each time; never retain removed slots in memory. */
export async function readBlobMedia(listPage: ListPage, configured: boolean, onUnavailable: () => void = () => {}) {
  const videos: Record<string, MediaSource> = {};
  const thumbnails: Record<string, string> = {};
  if (!configured) return { videos, thumbnails };
  let cursor: string | undefined;
  const seen = new Set<string>();
  const candidates = new Map<string, VideoBlob>();
  let pages = 0;
  const abortSignal = AbortSignal.timeout(10_000);
  try {
    do {
      // At most 10,000 listed objects and ten requests per refresh, including
      // unrelated files. Fail closed rather than publish an incomplete listing.
      if (++pages > 10) throw new Error("Blob listing exceeds discovery budget");
      const page = await listPage({ cursor, limit: 1000, abortSignal });
      for (const blob of page.blobs) {
        if (!matchBlobVideo(blob.pathname, blob.url) && !thumbnailSource(blob)) continue;
        const previous = candidates.get(blob.pathname);
        // Duplicate paths are normally prohibited by Blob; resolve defensively
        // by upload time and ETag so pagination order cannot change the winner.
        if (!previous || blob.uploadedAt.getTime() > previous.uploadedAt.getTime()
          || (blob.uploadedAt.getTime() === previous.uploadedAt.getTime() && blob.etag > previous.etag)) {
          candidates.set(blob.pathname, blob);
        }
      }
      if (!page.hasMore) break;
      if (!page.cursor || seen.has(page.cursor)) throw new Error("Invalid Blob pagination");
      seen.add(page.cursor);
      cursor = page.cursor;
    } while (cursor);

    for (const blob of candidates.values()) {
      const image = thumbnailSource(blob);
      if (image) {
        const slot = blob.pathname.replace(/\.(jpg|webp)$/, "");
        const existing = thumbnails[slot];
        if (existing && new URL(existing, "https://media.internal").pathname.endsWith(".webp")) continue;
        thumbnails[slot] = versionedSource(image, blob);
        continue;
      }
      const match = matchBlobVideo(blob.pathname, blob.url);
      if (!match || videos[match.slot]?.type === "video/mp4") continue;
      videos[match.slot] = { ...match.video, src: versionedSource(match.video.src, blob) };
    }
    return { videos, thumbnails };
  } catch {
    onUnavailable();
    return { videos: {}, thumbnails: {} };
  }
}

function versionedSource(source: string, blob: VideoBlob) {
  const url = new URL(source, "https://media.internal");
  url.searchParams.set("v", `${blob.etag}-${blob.uploadedAt.getTime()}`);
  return source.startsWith("/") ? `${url.pathname}${url.search}` : url.toString();
}

export async function readBlobVideos(listPage: ListPage, configured: boolean, onUnavailable?: () => void) {
  return (await readBlobMedia(listPage, configured, onUnavailable)).videos;
}
