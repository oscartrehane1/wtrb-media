import { approachStages } from "@/content/site";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function Approach() {
  return (
    <section id="approach" className="section section--approach page-shell" aria-labelledby="approach-title">
      <Reveal><div id="approach-title"><SectionHeading eyebrow="Our approach" title="From concept to campaign." description="Every great campaign starts with a purpose." /></div></Reveal>
      <Reveal delay={0.05}>
        <ol className="approach-list">
          {approachStages.map((stage, index) => (
            <li key={stage.title} className="approach-step"><span>0{index + 1}</span><h3>{stage.title}</h3><p>{stage.description}</p></li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
