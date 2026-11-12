import { BlobNotFoundError, get, head } from "@vercel/blob";
import { servePrivateVideo } from "@/lib/private-video";

export const runtime = "nodejs";

async function serve(request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  return servePrivateVideo(request, filename, {
    metadata: async (pathname) => {
      try {
        return await head(pathname, { abortSignal: AbortSignal.timeout(10_000) });
      } catch (error) {
        if (error instanceof BlobNotFoundError) return null;
        throw error;
      }
    },
    read: (pathname, range) => get(pathname, {
      access: "private",
      useCache: false,
      ...(range ? { headers: { Range: range } } : {}),
      abortSignal: request.signal,
    }),
  });
}

export const GET = serve;
export const HEAD = serve;
