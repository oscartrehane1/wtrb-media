import type { CaseStudy, CaseStudyFilm, PortfolioProject, ResolvedCaseStudyMedia } from "../types/media";
import type { DiscoveredProject } from "./project-discovery.ts";

export function manifestToStudy({ manifest: m }: DiscoveredProject): CaseStudy {
  return {
    slug: m.slug, title: m.title, subtitle: m.subtitle, sector: m.sector,
    classification: m.status === "commissioned" ? "Commissioned client work" : "Independent campaign concept",
    status: m.projectType, summary: m.summary, objective: m.campaignObjective, targetAudience: m.targetAudience,
    creativeStrategy: m.creativeStrategy, deliverables: m.deliverables, results: m.verifiedResults,
    productionApproach: "", credits: [], distributionChannels: [], successMeasures: [],
    media: { film: null, poster: null, photography: [] },
  };
}

export function projectMedia({ manifest, assets, videos }: DiscoveredProject, legacy?: ResolvedCaseStudyMedia): ResolvedCaseStudyMedia {
  const keys = (map: Record<string, string>, prefix: string) => Object.keys(map).filter((key) => key.startsWith(prefix + "-"))
    .sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
  const films = (kind: "landscape" | "vertical"): CaseStudyFilm[] => keys(videos, kind).map((key) => ({
    id: key, label: `${kind === "landscape" ? "Landscape" : "Vertical"} film ${key.split("-")[1]}`,
    aspectRatio: kind === "landscape" ? "16:9" : "9:16",
    video: { src: videos[key], type: videos[key].split("?")[0].endsWith(".webm") ? "video/webm" : "video/mp4" },
    poster: assets[key] ?? null,
  }));
  const [landscape, ...additionalLandscape] = films("landscape");
  const vertical = films("vertical");
  const photography = keys(assets, "photo").map((key) => ({
    id: key, src: assets[key], caption: `Photograph ${key.split("-")[1]}`,
    alt: manifest.photoAlt?.[key] ?? `${manifest.title} — photograph ${key.split("-")[1]}`,
  }));
  return { landscape: landscape ?? legacy?.landscape ?? null, additionalLandscape,
    vertical: vertical.length ? vertical : legacy?.vertical ?? [], photography: photography.length ? photography : legacy?.photography ?? [] };
}

export function projectCard(project: DiscoveredProject, media: ResolvedCaseStudyMedia, legacyPoster?: string): PortfolioProject {
  const { manifest: m, assets } = project;
  const film = media.landscape ?? media.vertical[0];
  return {
    id: m.slug, caseStudySlug: m.slug, title: m.title, clientType: m.status === "commissioned" ? "Commissioned client work" : "Independent project",
    category: m.projectType, description: m.summary, featured: m.featured, aspectRatio: film?.aspectRatio ?? "16:9",
    video: film?.video ?? null, youtubeVideoId: film?.youtubeVideoId,
    poster: assets.cover ?? film?.poster ?? media.photography[0]?.src ?? legacyPoster ?? null,
  };
}
