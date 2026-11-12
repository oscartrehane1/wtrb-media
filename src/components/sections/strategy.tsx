import { Reveal } from "@/components/ui/reveal";

export function Strategy() {
  return (
    <section className="section section--strategy page-shell" aria-labelledby="strategy-title">
      <Reveal className="strategy-grid">
        <p className="eyebrow">Purpose before production</p>
        <div>
          <h2 id="strategy-title" className="display-heading text-balance">More than beautiful content.</h2>
          <p className="strategy-lead">Great visuals capture attention. Great strategy gives that attention somewhere to go.</p>
          <div className="strategy-copy">
            <p>Whether you&apos;re launching a product, promoting a destination, building brand awareness or inspiring your next generation of customers, we approach every project with a clear objective.</p>
            <p>We combine creative planning, cinematic production and platform-ready content to help your message reach the people who matter.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
