import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const items = [
  { ratio: "wide", number: "01", label: "Brand film / 16:9" },
  { ratio: "portrait", number: "02", label: "Social campaign / 9:16" },
  { ratio: "square", number: "03", label: "Editorial short / 1:1" },
] as const;

export function WorkPlaceholder() {
  return (
    <section id="work" className="section section--work page-shell" aria-labelledby="work-title">
      <Reveal><div id="work-title"><SectionHeading eyebrow="Selected work" title="Films built around real places and honest experience." /></div></Reveal>
      <div className="work-grid">
        {items.map((item, index) => (
          <Reveal key={item.number} className={`project-placeholder project-placeholder--${item.ratio}`} delay={index * 0.08}>
            <div className="media-placeholder"><span>{item.number}</span></div>
            <p>{item.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
