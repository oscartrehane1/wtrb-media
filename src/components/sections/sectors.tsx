import { sectors } from "@/content/site";
import { Reveal } from "@/components/ui/reveal";

export function Sectors() {
  return (
    <section className="section section--sectors page-shell" aria-labelledby="sectors-title">
      <Reveal className="sectors-heading"><p className="eyebrow">Who we work with</p><h2 id="sectors-title" className="display-heading text-balance">Brands rooted in place, movement and experience.</h2></Reveal>
      <ul className="sectors-list">
        {sectors.map((sector, index) => <li key={sector}><span>0{index + 1}</span>{sector}</li>)}
      </ul>
    </section>
  );
}
