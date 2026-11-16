export const osloSlug = "oslo-before-the-winter";
export const projectPrefix = "projects/";
export const manifestLimit = 32 * 1024;
export const isProjectSlug = (slug: string) => slug.length <= 64 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export function parseProjectFilename(filename: string) {
  const match = /^(cover|(?:landscape|vertical|photo)-(0[1-9]|[1-9][0-9]{1,2}))\.(jpg|webp|mp4|webm)$/.exec(filename);
  if (!match) return null;
  const [, key, number, extension] = match;
  const video = extension === "mp4" || extension === "webm";
  if (video && (key === "cover" || key.startsWith("photo-"))) return null;
  return { key, number, extension, video };
}

export type ProjectManifest = {
  slug: string; title: string; subtitle: string; sector: string; projectType: string;
  status: "commissioned" | "independent";
  summary: string; campaignObjective: string; targetAudience: string; creativeStrategy: string;
  deliverables: string[]; verifiedResults?: string[];
  displayOrder: number; featured: boolean; publicationStatus: "draft" | "published";
  photoAlt?: Record<string, string>;
};

export function parseProjectManifest(value: unknown, slug: string): ProjectManifest | null {
  if (!isProjectSlug(slug) || !value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  const limits = { title: 120, subtitle: 240, sector: 100, projectType: 100, summary: 600, campaignObjective: 2000, targetAudience: 2000, creativeStrategy: 3000 } as const;
  const validText = (item: unknown, max: number): item is string => typeof item === "string" && item.trim().length > 0 && item.length <= max && !/[\u0000-\u001f\u007f]/.test(item);
  const keys = new Set([...Object.keys(limits), "slug", "status", "deliverables", "verifiedResults", "displayOrder", "featured", "publicationStatus", "photoAlt"]);
  const list = (items: unknown) => Array.isArray(items) && items.length > 0 && items.length <= 20 && items.every((item) => validText(item, 400));
  if (Object.keys(data).some((key) => !keys.has(key)) || data.slug !== slug ||
      !Object.entries(limits).every(([key, limit]) => validText(data[key], limit)) ||
      (data.status !== "commissioned" && data.status !== "independent") ||
      (data.publicationStatus !== "draft" && data.publicationStatus !== "published") ||
      typeof data.featured !== "boolean" || typeof data.displayOrder !== "number" ||
      !Number.isSafeInteger(data.displayOrder) || data.displayOrder < 0 || data.displayOrder > 9999 ||
      !list(data.deliverables) || (data.verifiedResults !== undefined && !list(data.verifiedResults))) return null;
  if (data.photoAlt !== undefined) {
    if (!data.photoAlt || typeof data.photoAlt !== "object" || Array.isArray(data.photoAlt)) return null;
    const alt = Object.entries(data.photoAlt);
    if (alt.length > 100 || alt.some(([key, item]) => !key.startsWith("photo-") || !parseProjectFilename(`${key}.jpg`) || !validText(item, 240))) return null;
  }
  return data as ProjectManifest;
}

export function canServeProjectAsset(manifest: ProjectManifest | null, slug: string, filename: string) {
  return manifest?.slug === slug && manifest.publicationStatus === "published" && Boolean(parseProjectFilename(filename));
}
