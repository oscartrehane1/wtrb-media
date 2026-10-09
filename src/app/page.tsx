import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { About } from "@/components/sections/about";
import { ContactPlaceholder } from "@/components/sections/contact-placeholder";
import { Hero } from "@/components/sections/hero";
import { PhotographyGallery } from "@/components/sections/photography-gallery";
import { Portfolio } from "@/components/sections/portfolio";
import { Services } from "@/components/sections/services";
import { photographyItems } from "@/content/photography";
import { portfolioProjects } from "@/content/portfolio";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <Portfolio projects={portfolioProjects} />
        <PhotographyGallery items={photographyItems} />
        <Services />
        <About />
        <ContactPlaceholder />
      </main>
      <SiteFooter />
    </>
  );
}
