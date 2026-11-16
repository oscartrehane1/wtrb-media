import type { HeroMedia, PortfolioProject } from "@/types/media";

/**
 * Add the final showreel paths here. Keep the short decorative background loop
 * muted; showreelUrl is the user-initiated, audio-enabled version.
 */
export const heroMedia: HeroMedia = {
  desktop: null,
  mobile: null,
  poster: null,
  // Example: showreelUrl: "/media/video/wtrb-showreel-full.mp4",
};

/** Compatibility metadata for the original public project until a Blob manifest is uploaded. */
export const portfolioProjects: PortfolioProject[] = [
  {
    id: "oslo-before-the-winter",
    title: "Oslo, Before the Winter",
    clientType: "Independent campaign concept",
    category: "Destination campaign",
    description: "An independently produced autumn destination campaign concept, with completed landscape and vertical films.",
    aspectRatio: "16:9",
    poster: null,
    video: null,
    duration: "01:00",
    featured: true,
    caseStudySlug: "oslo-before-the-winter",
  },
];
