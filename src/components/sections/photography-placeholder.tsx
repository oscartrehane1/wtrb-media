import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function PhotographyPlaceholder() {
  return (
    <section id="photography" className="section section--photography" aria-labelledby="photography-title">
      <Reveal className="page-shell"><div id="photography-title"><SectionHeading eyebrow="Photography" title="Still moments with a sense of movement." description="Landscape, adventure and commercial imagery created on location." /></div></Reveal>
      <div className="photo-track" aria-label="Photography placeholders">
        {["Landscape", "Adventure", "Lifestyle"].map((label, index) => (
          <div className="photo-placeholder" key={label}>
            <span>0{index + 1}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
