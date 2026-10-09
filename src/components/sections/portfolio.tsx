"use client";

import Image from "next/image";
import { useState } from "react";
import { VideoDialog } from "@/components/media/video-dialog";
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
                <span className="portfolio-project__media" style={{ aspectRatio: project.aspectRatio.replace(":", " / ") }}>
                  {project.poster ? (
                    <Image src={project.poster} alt="" fill sizes={project.featured ? "(min-width: 768px) 75vw, 100vw" : "(min-width: 768px) 40vw, 100vw"} />
                  ) : (
                    <span className="portfolio-project__placeholder" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></span>
                  )}
                  <span className="portfolio-project__action" aria-hidden="true">{playable ? "Play film" : "Preview"} ↗</span>
                </span>
                <span className="portfolio-project__meta">
                  <span><strong>{project.title}</strong><small>{project.clientType}</small></span>
                  <span><small>{project.category}</small><small>{project.duration}</small></span>
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>
      <VideoDialog project={activeProject} onClose={() => setActiveProject(null)} />
    </section>
  );
}
