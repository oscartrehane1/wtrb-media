import type { MetadataRoute } from "next";
import { getPublicProjects } from "@/lib/public-projects";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublicProjects();
  return [
    { url: "https://wtrbmedia.co.uk", changeFrequency: "monthly", priority: 1 },
    { url: "https://wtrbmedia.co.uk/services", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://wtrbmedia.co.uk/work", changeFrequency: "weekly", priority: 0.8 },
    ...projects.map(({ slug }) => ({ url: `https://wtrbmedia.co.uk/work/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: "https://wtrbmedia.co.uk/privacy", changeFrequency: "yearly", priority: 0.3 },
  ];
}
