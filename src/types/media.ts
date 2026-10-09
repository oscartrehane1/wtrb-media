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
};

export type PhotographyItem = {
  id: string;
  src: string | null;
  alt: string;
  caption: string;
  location?: string;
  width: number;
  height: number;
};
