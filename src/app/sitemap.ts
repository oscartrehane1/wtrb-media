import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://wtrbmedia.co.uk", changeFrequency: "monthly", priority: 1 },
    { url: "https://wtrbmedia.co.uk/privacy", changeFrequency: "yearly", priority: 0.3 },
  ];
}
