import "server-only";
import { cache } from "react";
import { caseStudies } from "@/content/case-studies";
import { portfolioProjects } from "@/content/portfolio";
import { getBlobMedia } from "./blob-media";
import { resolveCaseStudyMedia } from "./case-study-media-resolver";
import { allowLegacyOslo, getLiveManifest, getProjectCatalogue } from "./project-blob";
import { orderProjects } from "./project-discovery";
import { isProjectSlug, osloSlug } from "./project-manifest";
import { manifestToStudy, projectCard, projectMedia } from "./project-presentation";
import type { CaseStudy, PortfolioProject, ResolvedCaseStudyMedia } from "@/types/media";

type PublicProject = {
  slug: string; featured: boolean; displayOrder: number; study: CaseStudy;
  media: ResolvedCaseStudyMedia; card: PortfolioProject; socialImage?: string;
};

const legacy = caseStudies.find(({ slug }) => slug === osloSlug)!;
const legacyCard = portfolioProjects.find(({ caseStudySlug }) => caseStudySlug === osloSlug)!;

export const getPublicProjects = cache(async () => {
  const catalogue = await getProjectCatalogue();
  const includeLegacy = catalogue.legacyOslo || catalogue.projects.some(({ manifest }) => manifest.slug === osloSlug);
  const legacyAssets = includeLegacy ? await getBlobMedia() : undefined;
  const legacyMedia = legacyAssets ? resolveCaseStudyMedia(legacy, legacyAssets, legacyCard) : undefined;
  const legacyPoster = legacyAssets?.thumbnails["work-01"];
  const projects = catalogue.projects.map<PublicProject>((project) => {
    const { manifest } = project;
    const isOslo = manifest.slug === osloSlug;
    const study = { ...manifestToStudy(project), ...(isOslo ? {
      disclaimer: legacy.disclaimer, credits: legacy.credits, productionApproach: legacy.productionApproach,
      distributionChannels: legacy.distributionChannels, successMeasures: manifest.verifiedResults ? [] : legacy.successMeasures,
    } : {}) };
    const media = projectMedia(project, isOslo ? legacyMedia : undefined);
    return { slug: manifest.slug, featured: manifest.featured, displayOrder: manifest.displayOrder, study, media,
      card: projectCard(project, media, isOslo ? legacyPoster : undefined), socialImage: project.assets.cover ?? (isOslo ? legacyPoster : undefined) };
  });
  if (catalogue.legacyOslo && legacyMedia) {
    projects.push({ slug: osloSlug, featured: true, displayOrder: 0, study: legacy, media: legacyMedia,
      card: { ...legacyCard, poster: legacyPoster ?? legacyMedia.landscape?.poster ?? null,
        video: legacyAssets?.videos["work-01"] ?? legacyCard.video }, socialImage: legacyPoster });
  }
  return orderProjects(projects);
});

export const getPublicProject = cache(async (slug: string) => {
  if (!isProjectSlug(slug)) return null;
  const project = (await getPublicProjects()).find((item) => item.slug === slug);
  if (!project) return null;
  try {
    if (slug === osloSlug) return await allowLegacyOslo() ? project : null;
    const current = await getLiveManifest(slug);
    return current.kind === "valid" && current.manifest.publicationStatus === "published" ? project : null;
  } catch {
    return null;
  }
});
