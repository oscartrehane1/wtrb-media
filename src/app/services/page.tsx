import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { serviceCategories } from "@/content/site";

export const metadata: Metadata = {
  title: "Creative production and content marketing services",
  description: "Campaign strategy, film and photography production, content delivery and performance review for travel, outdoor and experience-led brands.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <a className="skip-link" href="#services-content">Skip to content</a>
      <SiteHeader />
      <main id="services-content" className="detail-page page-shell">
        <header className="detail-hero">
          <p className="eyebrow">Services</p>
          <h1>Film-led ideas, built for the wider campaign.</h1>
          <p>Bring us in for a single production or a coordinated content campaign. The scope should fit the challenge—not the other way around.</p>
        </header>

        <div className="service-details">
          {serviceCategories.map((service, index) => (
            <article key={service.title} className="service-detail">
              <div className="service-detail__title"><span>0{index + 1}</span><h2>{service.title}</h2></div>
              <div className="service-detail__body">
                <div><h3>The challenge</h3><p>{service.challenge}</p></div>
                <div><h3>Our approach</h3><p>{service.approach}</p></div>
                <div><h3>What may be included</h3><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><h3>How it connects</h3><p>{service.connection}</p></div>
              </div>
            </article>
          ))}
        </div>

        <section className="detail-cta" aria-labelledby="services-cta-title">
          <p className="eyebrow">Start a project</p>
          <h2 id="services-cta-title">Need one film—or a whole campaign?</h2>
          <p>Tell us what you&apos;re trying to achieve and we&apos;ll shape a proportionate approach around it.</p>
          <Link className="button button--light" href="/#contact">Start a project</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
