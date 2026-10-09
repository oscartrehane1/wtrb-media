import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { About } from "@/components/sections/about";
import { ContactPlaceholder } from "@/components/sections/contact-placeholder";
import { Hero } from "@/components/sections/hero";
import { PhotographyPlaceholder } from "@/components/sections/photography-placeholder";
import { Services } from "@/components/sections/services";
import { WorkPlaceholder } from "@/components/sections/work-placeholder";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <WorkPlaceholder />
        <PhotographyPlaceholder />
        <Services />
        <About />
        <ContactPlaceholder />
      </main>
      <SiteFooter />
    </>
  );
}
