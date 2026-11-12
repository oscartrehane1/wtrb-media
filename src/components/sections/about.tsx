import { Reveal } from "@/components/ui/reveal";

export function About() {
  return (
    <section id="about" className="section section--about page-shell" aria-labelledby="about-title">
      <Reveal className="about-grid">
        <p className="eyebrow">About WtRB</p>
        <div>
          <h2 id="about-title" className="display-heading text-balance">At home where the road bends.</h2>
          <p className="about-copy">WtRB Media is an independent creative production and content marketing studio specialising in travel, outdoor adventure and experience-led brands.</p>
          <p className="about-copy about-copy--muted">Our approach is personal and collaborative, connecting commercial objectives with creative strategy, cinematic production and useful campaign assets. Based in the South of England. Available across the UK and internationally.</p>
        </div>
        <div className="about-bts" aria-label="Behind-the-scenes photography placeholder"><span>Behind the scenes</span></div>
      </Reveal>
    </section>
  );
}
