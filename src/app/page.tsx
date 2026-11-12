import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { About } from "@/components/sections/about";
import { Approach } from "@/components/sections/approach";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { PhotographyGallery } from "@/components/sections/photography-gallery";
import { Portfolio } from "@/components/sections/portfolio";
import { Services } from "@/components/sections/services";
import { Sectors } from "@/components/sections/sectors";
import { Strategy } from "@/components/sections/strategy";
import { photographyItems } from "@/content/photography";
import { heroMedia, portfolioProjects } from "@/content/portfolio";
import { getBlobMedia } from "@/lib/blob-media";

export const revalidate = 60;

export default async function Home() {
  const { videos, thumbnails } = await getBlobMedia();
  const resolvedHero = { ...heroMedia, desktop: videos["hero-desktop"] ?? heroMedia.desktop, mobile: videos["hero-mobile"] ?? heroMedia.mobile, showreel: videos.showreel ?? heroMedia.showreel, showreelPoster: thumbnails.showreel ?? heroMedia.showreelPoster };
  const projects = portfolioProjects.map((project, index) => {
    const video = videos[`work-${String(index + 1).padStart(2, "0")}`];
    const poster = thumbnails[`work-${String(index + 1).padStart(2, "0")}`] ?? project.poster;
    return video ? { ...project, poster, video, youtubeVideoId: undefined, externalUrl: undefined } : { ...project, poster };
  });
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "WtRB Media",
    url: "https://wtrbmedia.co.uk",
    email: "hello@wtrbmedia.co.uk",
    description: "Creative production and content marketing studio for travel, tourism, outdoor adventure and experience-led brands.",
    areaServed: ["United Kingdom", "International"],
    slogan: "Stories Made Outside.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <main id="main-content">
        <Hero media={resolvedHero} />
        <Portfolio projects={projects} />
        <PhotographyGallery items={photographyItems} />
        <Strategy />
        <Services />
        <Approach />
        <Sectors />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
