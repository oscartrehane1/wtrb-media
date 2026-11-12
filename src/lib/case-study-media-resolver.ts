import type { CaseStudy, MediaSource, PortfolioProject, ResolvedCaseStudyMedia } from "@/types/media";
import { parseProjectAssetFilename } from "./media-filenames.ts";

type BlobMedia = { videos: Record<string, MediaSource>; thumbnails: Record<string, string> };

/** Editorial information is never inferred from asset presence or filenames. */
export function resolveCaseStudyMedia(study: CaseStudy, assets: BlobMedia, homepage?: PortfolioProject): ResolvedCaseStudyMedia {
  const slot = study.mediaSlot;
  const landscapeKey = `${slot}-landscape`;
  const dedicated = slot ? assets.videos[landscapeKey] : undefined;
  const legacy = slot && study.homepageLandscapeConfirmed && homepage?.aspectRatio === "16:9"
    ? assets.videos[slot] ?? homepage.video : undefined;
  const video = dedicated ?? study.media.film ?? legacy ?? null;
  // A dedicated upload replaces the configured YouTube fallback, as on home.
  const youtubeVideoId = dedicated ? undefined : study.media.youtubeVideoId;
  const landscape = video || youtubeVideoId ? {
    id: landscapeKey,
    label: "Landscape film",
    aspectRatio: "16:9" as const,
    video,
    youtubeVideoId,
    poster: assets.thumbnails[landscapeKey] ?? study.media.poster ?? (legacy && slot ? assets.thumbnails[slot] ?? homepage?.poster : null) ?? null,
  } : null;
  const numbered = (kind: "vertical" | "photo", map: Record<string, unknown>) => Object.keys(map)
    .map((key) => ({ key, parsed: parseProjectAssetFilename(`${key}.${kind === "photo" ? "jpg" : "mp4"}`) }))
    .filter(({ parsed }) => parsed !== null && parsed.slot === slot && parsed.kind === kind)
    .sort((a, b) => a.parsed!.index - b.parsed!.index);
  const vertical = numbered("vertical", assets.videos).map(({ key, parsed }) => ({
    id: key, label: `Vertical film ${String(parsed!.index).padStart(2, "0")}`, aspectRatio: "9:16" as const,
    video: assets.videos[key], poster: assets.thumbnails[key] ?? null,
  }));
  const photography = numbered("photo", assets.thumbnails).map(({ key, parsed }) => ({
    id: key, src: assets.thumbnails[key],
    alt: study.media.photoDescriptions?.[key]?.alt ?? `${study.title} — photograph ${parsed!.index}`,
    caption: study.media.photoDescriptions?.[key]?.caption ?? `Photograph ${String(parsed!.index).padStart(2, "0")}`,
  }));
  // Keep any deliberately configured local photography when no uploaded set exists.
  if (!photography.length) for (const image of study.media.photography) {
    if (image.src) photography.push({ id: image.id, src: image.src, alt: image.alt, caption: image.caption });
  }
  return { landscape, vertical, photography };
}
