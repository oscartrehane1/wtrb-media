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
import { heroMedia } from "@/content/portfolio";
import { getBlobMedia } from "@/lib/blob-media";
import { getPublicProjects } from "@/lib/public-projects";

export const revalidate = 60;

export default async function Home() {
  const [{ videos, thumbnails }, projects] = await Promise.all([getBlobMedia(), getPublicProjects()]);
  const resolvedHero = { ...heroMedia, desktop: videos["hero-desktop"] ?? heroMedia.desktop, mobile: videos["hero-mobile"] ?? heroMedia.mobile, showreel: videos.showreel ?? heroMedia.showreel, showreelPoster: thumbnails.showreel ?? heroMedia.showreelPoster };
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
        <Portfolio projects={projects.map(({ card }) => card)} />
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
