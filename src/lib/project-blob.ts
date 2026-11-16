import "server-only";
import { BlobNotFoundError, get, head, list } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { discoverProjects, readManifest, type ProjectStore } from "./project-discovery";
import { osloSlug, projectPrefix } from "./project-manifest";

const configured = () => Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
async function readPrivateBlob(pathname: string, signal: AbortSignal, range?: string) {
  try {
    return await get(pathname, { access: "private", useCache: false, abortSignal: signal, ...(range ? { headers: { Range: range } } : {}) });
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}
export async function privateBlobMetadata(pathname: string) {
  try {
    return await head(pathname, { abortSignal: AbortSignal.timeout(10_000) });
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}
const store: ProjectStore = {
  list: (options) => list({ ...options, abortSignal: AbortSignal.timeout(10_000) }),
  manifest: async (pathname) => {
    const result = await readPrivateBlob(pathname, AbortSignal.timeout(10_000));
    return result?.statusCode === 200 ? { size: result.blob.size, stream: result.stream } : null;
  },
};
const catalogue = unstable_cache(() => discoverProjects(store), ["project-catalogue-v1"], { revalidate: 60 });

export async function getProjectCatalogue() {
  if (!configured()) return { projects: [], legacyOslo: true };
  try {
    return await catalogue();
  } catch {
    console.warn("Project catalogue unavailable.");
    return { projects: [], legacyOslo: false };
  }
}

// Publication is checked live, never against the cached homepage catalogue.
export function getLiveManifest(slug: string) {
  return configured() ? readManifest(store, slug) : Promise.resolve({ kind: "missing" } as const);
}

export async function allowLegacyOslo() {
  const result = await getLiveManifest(osloSlug);
  return result.kind === "missing" || (result.kind === "valid" && result.manifest.publicationStatus === "published");
}

export function projectAssetStore(slug: string, filename: string, signal: AbortSignal) {
  const pathname = `${projectPrefix}${slug}/${filename}`;
  return {
    metadata: () => privateBlobMetadata(pathname),
    read: (_filename: string, range?: string) => readPrivateBlob(pathname, signal, range),
  };
}
