import Link from "next/link";

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__media" aria-hidden="true">
        <div className="hero__media-grid" />
        <span className="hero__media-label">Cinematic media placeholder</span>
      </div>
      <div className="hero__shade" />
      <div className="hero__content page-shell">
        <p className="hero__kicker">Outdoor film &amp; photography</p>
        <h1 id="hero-title" className="hero__title">Stories<br />Made Outside.</h1>
        <div className="hero__footer">
          <p>Full-service production for brands that belong beyond the beaten path.</p>
          <div className="hero__actions">
            <Link className="button button--light" href="#work">View selected work</Link>
            <Link className="text-link" href="#contact">Start a project <span aria-hidden="true">↘</span></Link>
          </div>
        </div>
      </div>
      <a className="hero__scroll" href="#work"><span>Scroll to explore</span><span aria-hidden="true">↓</span></a>
    </section>
  );
}
