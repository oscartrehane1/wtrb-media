"use client";

import Link from "next/link";
import { useState } from "react";
import { VideoDialog } from "@/components/media/video-dialog";
import { PortfolioThumbnail } from "@/components/media/portfolio-thumbnail";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { PortfolioProject } from "@/types/media";

type PortfolioProps = { projects: PortfolioProject[] };

export function Portfolio({ projects, listing = false }: PortfolioProps & { listing?: boolean }) {
  const [activeProject, setActiveProject] = useState<PortfolioProject | null>(null);

  return (
    <section id="work" className="section section--work page-shell" aria-labelledby="work-title">
      <Reveal><div id="work-title"><SectionHeading eyebrow={listing ? "Portfolio" : "Selected work"} title="Work built around real places and honest experience." /></div></Reveal>
      {!projects.length ? <p>New work will appear here when it’s published.</p> : null}
      <div className="portfolio-grid" data-layout={projects.length === 1 ? "single" : projects.length === 2 ? "pair" : "grid"}>
        {projects.map((project, index) => {
          const playable = Boolean(project.youtubeVideoId || project.video || project.externalUrl);
          return (
            <Reveal key={project.id} className="portfolio-project" delay={Math.min(index, 4) * 0.06}>
              {playable ? <button
                className="portfolio-project__button"
                type="button"
                onClick={() => setActiveProject(project)}
                aria-label={`${playable ? "Play" : "View"} ${project.title}`}
              >
                <span className="portfolio-project__media">
                  <PortfolioThumbnail poster={project.poster} featured={project.featured} category={project.category} />
                  <span className="portfolio-project__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="m9 5 11 7-11 7z" /></svg></span>
                  <span className="portfolio-project__action" aria-hidden="true">{playable ? "Play film" : "View project"}</span>
                </span>
                <span className="portfolio-project__meta">
                  <span><strong>{project.title}</strong><small>{project.clientType}</small></span>
                  <span><small>{project.category}</small><small>{project.duration}</small></span>
                </span>
              </button> : <Link className="portfolio-project__button" href={`/work/${project.id}`}>
                <span className="portfolio-project__media">
                  <PortfolioThumbnail poster={project.poster} featured={project.featured} category={project.category} />
                  <span className="portfolio-project__action" aria-hidden="true">View project ↗</span>
                </span>
                <span className="portfolio-project__meta"><span><strong>{project.title}</strong><small>{project.clientType}</small></span><span><small>{project.category}</small></span></span>
              </Link>}
              {playable && project.caseStudySlug ? <Link className="portfolio-project__link" href={`/work/${project.caseStudySlug}`}>View case study: {project.title} <span aria-hidden="true">↗</span></Link> : null}
            </Reveal>
          );
        })}
      </div>
      {!listing && projects.length ? <Link className="portfolio-project__link" href="/work">Explore all work <span aria-hidden="true">↗</span></Link> : null}
      <VideoDialog project={activeProject} onClose={() => setActiveProject(null)} />
    </section>
  );
}
