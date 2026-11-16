import { getLiveManifest, projectAssetStore } from "@/lib/project-blob";
import { serveProjectMedia } from "@/lib/project-media";

export const runtime = "nodejs";

async function serve(request: Request, context: { params: Promise<{ slug: string; filename: string }> }) {
  const { slug, filename } = await context.params;
  return serveProjectMedia(request, slug, filename, {
    manifest: getLiveManifest,
    assetStore: (slug, name) => projectAssetStore(slug, name, request.signal),
  });
}

export const GET = serve;
export const HEAD = serve;
