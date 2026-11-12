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

/**
 * Demonstration records define the intended editorial layout without claiming
 * real commissions. Replace null media fields when approved assets are ready.
 * Reorder this array to change the order on the page.
 */
export const portfolioProjects: PortfolioProject[] = [
  {
    id: "oslo-before-the-winter",
    title: "Oslo, Before the Winter",
    clientType: "Independent campaign concept",
    category: "Destination campaign",
    description: "An independently produced autumn destination campaign concept. Landscape film in development.",
    aspectRatio: "16:9",
    poster: null,
    video: null,
    duration: "In development",
    featured: true,
    caseStudySlug: "oslo-before-the-winter",
  },
  {
    id: "demonstration-vertical",
    title: "Vertical story",
    clientType: "Demonstration project",
    category: "Social campaign",
    description: "A portrait position designed for social-first campaign filmmaking.",
    aspectRatio: "9:16",
    poster: null,
    // youtubeVideoId: "UNLISTED_YOUTUBE_VIDEO_ID",
    video: null,
    duration: "—",
  },
  {
    id: "demonstration-portrait",
    title: "Portrait campaign",
    clientType: "Demonstration project",
    category: "Campaign content",
    description: "A four-by-five project position for editorial campaign work.",
    aspectRatio: "4:5",
    poster: null,
    video: null,
    duration: "—",
  },
  {
    id: "demonstration-square",
    title: "Field notes",
    clientType: "Demonstration project",
    category: "Social short",
    description: "A square project position for concise stories from the field.",
    aspectRatio: "1:1",
    poster: null,
    video: null,
    duration: "—",
  },
];
