import type { CaseStudy } from "@/types/media";

export const caseStudies: CaseStudy[] = [
  {
    slug: "oslo-before-the-winter",
    mediaSlot: "work-01",
    // Verified native video metadata: existing work-01.mp4 is 1920 × 1080.
    // Keep legacy replacements landscape, or remove this confirmation.
    homepageLandscapeConfirmed: true,
    title: "Oslo, Before the Winter",
    classification: "Independent campaign concept",
    disclaimer: "Independently produced by WtRB Media. This project was not commissioned or endorsed by VisitOSLO.",
    sector: "Tourism and destinations",
    status: "Landscape campaign film in development. Vertical social film completed; final public media asset pending.",
    summary: "A seasonal destination concept exploring how Oslo could be positioned as an autumn city-break beyond its best-known waterfront attractions.",
    objective: "Encourage autumn tourism in Oslo and inspire visitors to explore more of the city before winter arrives.",
    targetAudience: "Experience-led travellers considering a European shoulder-season city break.",
    creativeStrategy: "Use seasonal colour, historic streets and riverside environments to present Oslo as a walkable, atmospheric autumn destination with more to discover beyond the waterfront.",
    productionApproach: "A film-led concept designed around a landscape campaign film and a shorter vertical narrative, with location-led sequences that can support a wider family of destination content.",
    deliverables: ["Approximately 60-second landscape campaign film — in development", "Approximately 30-second vertical social film — completed; public asset pending"],
    distributionChannels: ["Destination website", "Organic social", "Vertical social video", "Campaign landing page"],
    successMeasures: ["Qualified campaign-film views", "Video completion and engagement", "Click-through to destination planning content", "Interest in autumn travel content"],
    credits: ["Concept, creative direction and production — WtRB Media"],
    media: { film: null, poster: null, photography: [] },
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
