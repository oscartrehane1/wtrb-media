import { services } from "@/content/site";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function Services() {
  return (
    <section id="services" className="section section--services page-shell" aria-labelledby="services-title">
      <Reveal><div id="services-title"><SectionHeading eyebrow="Full-service production" title="From the first idea to the final delivery." description="WtRB Media manages the complete creative process for outdoor brands, destinations and experiences—shaping the concept, planning the production, creating the work and delivering it in the formats the campaign needs." /></div></Reveal>
      <ol className="services-list">
        {services.map((service, index) => (
          <li key={service.title}><span>0{index + 1}</span><div><p>{service.title}</p><small>{service.description}</small></div></li>
        ))}
      </ol>
    </section>
  );
}
