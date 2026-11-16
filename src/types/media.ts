export type VideoAspectRatio = "16:9" | "9:16" | "4:5" | "1:1";

export type MediaSource = {
  src: string;
  type: "video/mp4" | "video/webm";
};

export type HeroMedia = {
  desktop: MediaSource | null;
  mobile: MediaSource | null;
  poster: string | null;
  showreelUrl?: string;
  showreel?: MediaSource;
  showreelPoster?: string;
};

export type PortfolioProject = {
  id: string;
  title: string;
  clientType: string;
  category: string;
  description: string;
  aspectRatio: VideoAspectRatio;
  poster: string | null;
  video: MediaSource | null;
  youtubeVideoId?: string;
  externalUrl?: string;
  duration?: string;
  featured?: boolean;
  caseStudySlug?: string;
};

export type ProjectClassification = "Commissioned client work" | "Independent campaign concept" | "Personal creative project";

export type CaseStudy = {
  slug: string;
  mediaSlot?: "work-01" | "work-02" | "work-03" | "work-04";
  /** Explicit confirmation of the actual legacy film, not its card's crop. */
  homepageLandscapeConfirmed?: boolean;
  title: string;
  classification: ProjectClassification;
  disclaimer?: string;
  sector: string;
  status: string;
  summary: string;
  subtitle?: string;
  objective: string;
  targetAudience: string;
  creativeStrategy: string;
  productionApproach: string;
  deliverables: readonly string[];
  distributionChannels: readonly string[];
  successMeasures: readonly string[];
  results?: readonly string[];
  credits: readonly string[];
  media: {
    film: MediaSource | null;
    youtubeVideoId?: string;
    poster: string | null;
    photography: readonly PhotographyItem[];
    photoDescriptions?: Readonly<Record<string, { alt: string; caption?: string }>>;
  };
};

export type CaseStudyFilm = {
  id: string;
  label: string;
  aspectRatio: "16:9" | "9:16";
  video: MediaSource | null;
  youtubeVideoId?: string;
  poster: string | null;
};

export type CaseStudyPhoto = { id: string; src: string; alt: string; caption: string };
export type ResolvedCaseStudyMedia = { landscape: CaseStudyFilm | null; additionalLandscape?: CaseStudyFilm[]; vertical: CaseStudyFilm[]; photography: CaseStudyPhoto[] };

export type PhotographyItem = {
  id: string;
  src: string | null;
  alt: string;
  caption: string;
  location?: string;
  width: number;
  height: number;
};
