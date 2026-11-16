import { isProjectSlug, manifestLimit, osloSlug, parseProjectFilename, parseProjectManifest, projectPrefix, type ProjectManifest } from "./project-manifest.ts";

type Entry = { pathname: string; etag: string; uploadedAt: Date };
export type ProjectStore = {
  list: (options: { prefix: string; cursor?: string; limit: number }) => Promise<{ blobs: Entry[]; hasMore: boolean; cursor?: string }>;
  manifest: (pathname: string) => Promise<{ size: number; stream: ReadableStream<Uint8Array> } | null>;
};
export type DiscoveredProject = { manifest: ProjectManifest; assets: Record<string, string>; videos: Record<string, string> };

export async function readManifest(store: Pick<ProjectStore, "manifest">, slug: string) {
  if (!isProjectSlug(slug)) return { kind: "invalid" } as const;
  const result = await store.manifest(`${projectPrefix}${slug}/project.json`);
  if (!result) return { kind: "missing" } as const;
  if (result.size > manifestLimit) {
    await result.stream.cancel();
    return { kind: "invalid" } as const;
  }
  const reader = result.stream.getReader();
  const bytes = new Uint8Array(manifestLimit);
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (length + value.byteLength > manifestLimit) {
        await reader.cancel();
        return { kind: "invalid" } as const;
      }
      bytes.set(value, length);
      length += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }
  try {
    const manifest = parseProjectManifest(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, length))), slug);
    if (manifest) return { kind: "valid", manifest } as const;
  } catch {
    // A malformed upload affects only this project.
  }
  return { kind: "invalid" } as const;
}

export async function discoverProjects(store: ProjectStore) {
  const folders = new Map<string, Map<string, Entry>>();
  let cursor: string | undefined;
  const seen = new Set<string>();
  for (let page = 0; page < 8; page++) {
    const result = await store.list({ prefix: projectPrefix, limit: 500, cursor });
    for (const entry of result.blobs) {
      const [prefix, slug, filename, ...extra] = entry.pathname.split("/");
      if (prefix !== "projects" || !slug || !isProjectSlug(slug) || !filename || extra.length || (filename !== "project.json" && !parseProjectFilename(filename))) continue;
      const entries = folders.get(slug) ?? new Map<string, Entry>();
      const existing = entries.get(filename);
      if (!existing || entry.uploadedAt.getTime() > existing.uploadedAt.getTime() ||
          (entry.uploadedAt.getTime() === existing.uploadedAt.getTime() && entry.etag > existing.etag)) entries.set(filename, entry);
      folders.set(slug, entries);
    }
    if (!result.hasMore) break;
    if (page === 7 || !result.cursor || seen.has(result.cursor)) throw new Error("Project discovery exceeds listing budget");
    cursor = result.cursor;
    seen.add(cursor);
  }
  const candidates = [...folders].filter(([slug, entries]) => slug !== osloSlug && entries.has("project.json"));
  // Absence from a listing alone must never enable a legacy public project.
  candidates.push([osloSlug, folders.get(osloSlug) ?? new Map()]);
  if (candidates.length > 100) throw new Error("Project discovery exceeds manifest budget");
  const projects: DiscoveredProject[] = [];
  let legacyOslo = false;
  for (let offset = 0; offset < candidates.length; offset += 8) {
    await Promise.all(candidates.slice(offset, offset + 8).map(async ([slug, entries]) => {
      const result = await readManifest(store, slug);
      if (slug === osloSlug) legacyOslo = result.kind === "missing";
      if (result.kind !== "valid" || result.manifest.publicationStatus !== "published") return;
      const assets: Record<string, string> = {};
      const videos: Record<string, string> = {};
      // Overwrite alternatives in priority order: WebP over JPEG, MP4 over WebM.
      for (const [filename, entry] of [...entries].sort(([a], [b]) => a.localeCompare(b))) {
        const asset = parseProjectFilename(filename);
        if (!asset) continue;
        const url = `/api/project-media/${slug}/${filename}?v=${encodeURIComponent(entry.etag)}-${entry.uploadedAt.getTime()}`;
        if (asset.video) {
          if (!videos[asset.key] || asset.extension === "mp4") videos[asset.key] = url;
        } else if (!assets[asset.key] || asset.extension === "webp") assets[asset.key] = url;
      }
      projects.push({ manifest: result.manifest, assets, videos });
    }));
  }
  return { projects, legacyOslo };
}

export function orderProjects<T extends { slug: string; featured: boolean; displayOrder: number }>(projects: T[]) {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder || a.slug.localeCompare(b.slug));
}
