import Link from "next/link";
import { serviceCategories } from "@/content/site";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function Services() {
  return (
    <section id="services" className="section section--services page-shell" aria-labelledby="services-title">
      <Reveal><div id="services-title"><SectionHeading eyebrow="What we do" title="Strategy, production and purposeful delivery." description="Commission a focused film or photography project, or bring us into a wider campaign—from the first objective to the final platform-ready assets." /></div><Link className="text-link services-page-link" href="/services">Explore all services <span aria-hidden="true">↗</span></Link></Reveal>
      <ol className="services-list">
        {serviceCategories.map((service, index) => (
          <li key={service.title}><span>0{index + 1}</span><div><p>{service.title}</p><small>{service.shortDescription}</small></div></li>
        ))}
      </ol>
    </section>
  );
}
