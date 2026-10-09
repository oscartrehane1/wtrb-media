import { Reveal } from "@/components/ui/reveal";

export function About() {
  return (
    <section id="about" className="section section--about page-shell" aria-labelledby="about-title">
      <Reveal className="about-grid">
        <p className="eyebrow">About WtRB</p>
        <div>
          <h2 id="about-title" className="display-heading text-balance">At home where the road ends.</h2>
          <p className="about-copy">WtRB Media is a specialist outdoor production company creating purposeful films and photography in mountains, forests, coastlines and remote landscapes.</p>
          <p className="about-copy about-copy--muted">Our small, capable team combines considered creative direction with the practical experience needed to work responsibly in demanding environments.</p>
        </div>
      </Reveal>
    </section>
  );
}
