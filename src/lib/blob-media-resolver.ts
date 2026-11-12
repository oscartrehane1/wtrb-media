import type { MediaSource } from "@/types/media";

export type VideoBlob = { pathname: string; url: string; uploadedAt: Date; etag: string };
type BlobPage = { blobs: VideoBlob[]; hasMore: boolean; cursor?: string };
type ListPage = (options: { cursor?: string; limit: number; abortSignal: AbortSignal }) => Promise<BlobPage>;

export function isVideoFilename(pathname: string) {
  return /^(hero-desktop|hero-mobile|showreel|work-0[1-4])\.(mp4|webm)$/.test(pathname);
}

export function matchBlobVideo(pathname: string, source: string): { slot: string; video: MediaSource } | null {
  const match = /^(hero-desktop|hero-mobile|showreel|work-0[1-4])\.(mp4|webm)$/.exec(pathname);
  if (!match) return null;
  try {
    const url = new URL(source);
    const publicBlob = url.hostname.endsWith(".public.blob.vercel-storage.com");
    const privateBlob = url.hostname.endsWith(".private.blob.vercel-storage.com");
    if (url.protocol !== "https:" || (!publicBlob && !privateBlob) || url.username || url.password) return null;
    return { slot: match[1], video: { src: privateBlob ? `/api/media/${pathname}` : source, type: match[2] === "mp4" ? "video/mp4" : "video/webm" } };
  } catch {
    return null;
  }
}

/** Resolve a fresh complete listing each time; never retain removed slots in memory. */
export async function readBlobVideos(listPage: ListPage, configured: boolean, onUnavailable: () => void = () => {}) {
  const videos: Record<string, MediaSource> = {};
  if (!configured) return videos;
  let cursor: string | undefined;
  const seen = new Set<string>();
  const candidates = new Map<string, VideoBlob>();
  const abortSignal = AbortSignal.timeout(10_000);
  try {
    do {
      const page = await listPage({ cursor, limit: 1000, abortSignal });
      for (const blob of page.blobs) {
        if (!matchBlobVideo(blob.pathname, blob.url)) continue;
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
      const match = matchBlobVideo(blob.pathname, blob.url);
      if (!match || videos[match.slot]?.type === "video/mp4") continue;
      const url = new URL(match.video.src, "https://media.internal");
      // Changed bytes or a replacement upload produces a new browser cache key.
      url.searchParams.set("v", `${blob.etag}-${blob.uploadedAt.getTime()}`);
      videos[match.slot] = { ...match.video, src: match.video.src.startsWith("/") ? `${url.pathname}${url.search}` : url.toString() };
    }
    return videos;
  } catch {
    onUnavailable();
    return {};
  }
}
