import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CaseStudyMedia } from "@/components/media/case-study-media";
import { getPublicProject } from "@/lib/public-projects";

type CaseStudyPageProps = { params: Promise<{ slug: string }> };

// The catalogue is cached, but direct case-study publication is checked live.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const project = await getPublicProject((await params).slug);
  if (!project) return { robots: { index: false, follow: false } };
  const { study, socialImage } = project;
  return {
    title: study.title,
    description: study.summary,
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: { title: `${study.title} — WtRB Media`, description: study.summary, url: `/work/${study.slug}`, images: [socialImage ?? "/opengraph-image"] },
    twitter: { card: "summary_large_image", title: study.title, description: study.summary, images: [socialImage ?? "/opengraph-image"] },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const project = await getPublicProject((await params).slug);
  if (!project) notFound();
  const { study, media } = project;

  return (
    <>
      <a className="skip-link" href="#case-study-content">Skip to content</a>
      <SiteHeader />
      <main id="case-study-content" className="case-study">
        <header className="case-study__hero page-shell">
          <p className="eyebrow">{study.classification}</p>
          <h1>{study.title}</h1>
          {study.subtitle ? <p className="eyebrow">{study.subtitle}</p> : null}
          <p className="case-study__summary">{study.summary}</p>
          <dl><div><dt>Sector</dt><dd>{study.sector}</dd></div><div><dt>Status</dt><dd>{study.status}</dd></div></dl>
          {study.disclaimer ? <p className="case-study__disclaimer">{study.disclaimer}</p> : null}
        </header>

        <CaseStudyMedia study={study} media={media} />

        <div className="case-study__content page-shell">
          <section><h2>Campaign objective</h2><p>{study.objective}</p></section>
          <section><h2>Audience</h2><p>{study.targetAudience}</p></section>
          <section><h2>Creative strategy</h2><p>{study.creativeStrategy}</p></section>
          {study.productionApproach ? <section><h2>Production approach</h2><p>{study.productionApproach}</p></section> : null}

          {([
            ["Deliverables", study.deliverables],
            ["Intended channels", study.distributionChannels],
            ["Success measures", study.successMeasures],
            ["Verified results", study.results ?? []],
            ["Credits", study.credits],
          ] as const).map(([heading, items]) => items.length ? (
            <section className="case-study__list" key={heading}><h2>{heading}</h2>
              {heading === "Success measures" ? <p className="case-study__note">No results are presented: these are the measures that would frame evaluation.</p> : null}
              <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
            </section>
          ) : null)}
        </div>

        <section className="detail-cta page-shell" aria-labelledby="case-study-cta-title">
          <p className="eyebrow">Relevant project</p>
          <h2 id="case-study-cta-title">Planning a destination or experience-led campaign?</h2>
          <p>Let&apos;s shape the objective, creative direction and production around the people you want to reach.</p>
          <Link className="button button--light" href="/#contact">Start a project</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
