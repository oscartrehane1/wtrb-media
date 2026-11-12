import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CaseStudyMedia } from "@/components/media/case-study-media";
import { PhotographyGallery } from "@/components/sections/photography-gallery";
import { caseStudies, getCaseStudy } from "@/content/case-studies";

type CaseStudyPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const study = getCaseStudy((await params).slug);
  if (!study) return {};
  return {
    title: study.title,
    description: study.summary,
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: { title: `${study.title} — WtRB Media`, description: study.summary, url: `/work/${study.slug}` },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const study = getCaseStudy((await params).slug);
  if (!study) notFound();

  return (
    <>
      <a className="skip-link" href="#case-study-content">Skip to content</a>
      <SiteHeader />
      <main id="case-study-content" className="case-study">
        <header className="case-study__hero page-shell">
          <p className="eyebrow">{study.classification}</p>
          <h1>{study.title}</h1>
          <p className="case-study__summary">{study.summary}</p>
          <dl><div><dt>Sector</dt><dd>{study.sector}</dd></div><div><dt>Status</dt><dd>{study.status}</dd></div></dl>
          {study.disclaimer ? <p className="case-study__disclaimer">{study.disclaimer}</p> : null}
        </header>

        <CaseStudyMedia study={study} />

        <div className="case-study__content page-shell">
          <section><p className="eyebrow">01 / Campaign objective</p><h2>Give autumn travel a reason to begin in Oslo.</h2><p>{study.objective}</p></section>
          <section><p className="eyebrow">02 / Audience</p><h2>Who the idea is designed to move.</h2><p>{study.targetAudience}</p></section>
          <section><p className="eyebrow">03 / Creative strategy</p><h2>Season, place and discovery.</h2><p>{study.creativeStrategy}</p></section>
          <section><p className="eyebrow">04 / Production approach</p><h2>A film-led family of assets.</h2><p>{study.productionApproach}</p></section>

          <section className="case-study__list"><p className="eyebrow">05 / Planned deliverables</p><ul>{study.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section className="case-study__list"><p className="eyebrow">06 / Intended channels</p><ul>{study.distributionChannels.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section className="case-study__list"><p className="eyebrow">07 / Success measures</p><p className="case-study__note">No results are presented: this is an independent concept. These are the measures that would frame evaluation.</p><ul>{study.successMeasures.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section className="case-study__list"><p className="eyebrow">Credits</p><ul>{study.credits.map((item) => <li key={item}>{item}</li>)}</ul></section>
        </div>

        {study.media.photography.length ? <PhotographyGallery items={[...study.media.photography]} /> : null}

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
