import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { PhotographyGallery } from "@/components/sections/photography-gallery";
import { Portfolio } from "@/components/sections/portfolio";
import { Services } from "@/components/sections/services";
import { photographyItems } from "@/content/photography";
import { portfolioProjects } from "@/content/portfolio";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "WtRB Media",
    url: "https://wtrbmedia.co.uk",
    email: "hello@wtrbmedia.co.uk",
    description: "Independent outdoor film and photography production business based in the South of England and available for productions across the UK and internationally.",
    areaServed: ["United Kingdom", "International"],
    slogan: "Stories Made Outside.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <Portfolio projects={portfolioProjects} />
        <PhotographyGallery items={photographyItems} />
        <Services />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
