import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Portfolio } from "@/components/sections/portfolio";
import { getPublicProjects } from "@/lib/public-projects";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Portfolio",
  description: "Explore film, photography and creative campaigns by WtRB Media.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const projects = await getPublicProjects();
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader />
    <main id="main-content" className="work-index">
      <h1 className="sr-only">WtRB Media portfolio</h1>
      <Portfolio listing projects={projects.map(({ card }) => card)} />
    </main>
    <SiteFooter />
  </>;
}
