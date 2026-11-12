"use client";

import Link from "next/link";
import { useState } from "react";
import { VideoDialog } from "@/components/media/video-dialog";
import { PortfolioThumbnail } from "@/components/media/portfolio-thumbnail";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { PortfolioProject } from "@/types/media";

type PortfolioProps = { projects: PortfolioProject[] };

export function Portfolio({ projects }: PortfolioProps) {
  const [activeProject, setActiveProject] = useState<PortfolioProject | null>(null);

  return (
    <section id="work" className="section section--work page-shell" aria-labelledby="work-title">
      <Reveal><div id="work-title"><SectionHeading eyebrow="Selected work" title="Films built around real places and honest experience." /></div></Reveal>
      <div className="portfolio-grid">
        {projects.map((project, index) => {
          const playable = Boolean(project.youtubeVideoId || project.video || project.externalUrl);
          return (
            <Reveal key={project.id} className={`portfolio-project portfolio-project--${index + 1}`} delay={index * 0.06}>
              <button
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
              </button>
              {project.caseStudySlug ? <Link className="portfolio-project__link" href={`/work/${project.caseStudySlug}`}>View case study <span aria-hidden="true">↗</span></Link> : null}
            </Reveal>
          );
        })}
      </div>
      <VideoDialog project={activeProject} onClose={() => setActiveProject(null)} />
    </section>
  );
}
