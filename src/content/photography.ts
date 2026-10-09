import type { PhotographyItem } from "@/types/media";

/**
 * Demonstration entries preserve a varied editorial rhythm without using stock
 * imagery. Replace `src: null` with an approved image path and write factual alt
 * text. Reorder this array to change the gallery sequence.
 */
export const photographyItems: PhotographyItem[] = [
  {
    id: "demonstration-landscape",
    src: null,
    alt: "Demonstration landscape image position",
    caption: "Landscape study",
    location: "Location to be confirmed",
    width: 1800,
    height: 1200,
  },
  {
    id: "demonstration-portrait",
    src: null,
    alt: "Demonstration portrait image position",
    caption: "Human in the landscape",
    location: "Location to be confirmed",
    width: 1200,
    height: 1600,
  },
  {
    id: "demonstration-square",
    src: null,
    alt: "Demonstration square image position",
    caption: "Details from the field",
    location: "Location to be confirmed",
    width: 1400,
    height: 1400,
  },
];
