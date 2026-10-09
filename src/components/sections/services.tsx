import { services } from "@/content/site";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function Services() {
  return (
    <section id="services" className="section section--services page-shell" aria-labelledby="services-title">
      <Reveal><div id="services-title"><SectionHeading eyebrow="End-to-end production" title="One crew. From the first idea to the final frame." description="We shape, shoot and finish cinematic work for outdoor brands, destinations and organisations." /></div></Reveal>
      <ol className="services-list">
        {services.map((service, index) => (
          <li key={service}><span>0{index + 1}</span><p>{service}</p></li>
        ))}
      </ol>
    </section>
  );
}
