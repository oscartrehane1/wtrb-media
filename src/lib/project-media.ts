import { canServeProjectAsset, isProjectSlug, parseProjectFilename } from "./project-manifest.ts";
import type { readManifest } from "./project-discovery.ts";
import { streamApprovedThumbnail } from "./private-thumbnail.ts";
import { streamApprovedVideo } from "./private-video.ts";

type AssetStore = Parameters<typeof streamApprovedVideo>[2] & Parameters<typeof streamApprovedThumbnail>[2];

export async function serveProjectMedia(request: Request, slug: string, filename: string, deps: {
  manifest: (slug: string) => ReturnType<typeof readManifest>;
  assetStore: (slug: string, filename: string) => AssetStore;
}) {
  const asset = parseProjectFilename(filename);
  const unavailable = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  if (!isProjectSlug(slug) || !asset) return unavailable(404);
  try {
    const result = await deps.manifest(slug);
    if (result.kind !== "valid" || !canServeProjectAsset(result.manifest, slug, filename)) return unavailable(404);
    const store = deps.assetStore(slug, filename);
    return asset.video ? streamApprovedVideo(request, filename, store) : streamApprovedThumbnail(request, filename, store);
  } catch {
    return unavailable(503);
  }
}
