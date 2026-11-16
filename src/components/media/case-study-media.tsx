"use client";

import { useState } from "react";
import { PortfolioThumbnail } from "@/components/media/portfolio-thumbnail";
import { VideoDialog } from "@/components/media/video-dialog";
import { CaseStudyGallery } from "@/components/media/case-study-gallery";
import type { CaseStudy, CaseStudyFilm, PortfolioProject, ResolvedCaseStudyMedia } from "@/types/media";

export function CaseStudyMedia({ study, media }: { study: CaseStudy; media: ResolvedCaseStudyMedia }) {
  const [active, setActive] = useState<CaseStudyFilm | null>(null);
  const project: PortfolioProject | null = active ? {
    id: active.id, title: `${study.title} — ${active.label}`, clientType: study.classification,
    category: study.sector, description: study.summary, aspectRatio: active.aspectRatio,
    poster: active.poster, video: active.video, youtubeVideoId: active.youtubeVideoId,
  } : null;
  const filmCard = (film: CaseStudyFilm) => (
    <button className="case-film" type="button" key={film.id} onClick={() => setActive(film)} aria-label={`Play ${film.label} — ${study.title}`}>
      <span className={`case-film__frame ${film.aspectRatio === "9:16" ? "case-film__frame--vertical" : ""}`}>
        <PortfolioThumbnail poster={film.poster} category={film.label} sizes={film.aspectRatio === "16:9" ? "90vw" : "(min-width: 768px) 30vw, 75vw"} />
        <span className="case-film__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="m9 5 11 7-11 7z" /></svg></span>
      </span>
      <span className="case-film__caption">{film.label}<span aria-hidden="true">Play film ↗</span></span>
    </button>
  );

  return (
    <div className="case-media page-shell">
      {media.landscape ? <section className="case-media__section" aria-labelledby="landscape-title"><h2 id="landscape-title">{media.additionalLandscape?.length ? "Landscape films" : "Landscape film"}</h2>{[media.landscape, ...(media.additionalLandscape ?? [])].map(filmCard)}</section> : null}
      {media.vertical.length ? <section className="case-media__section" aria-labelledby="vertical-title"><h2 id="vertical-title">Vertical films</h2><div className="case-media__vertical">{media.vertical.map(filmCard)}</div></section> : null}
      {media.photography.length ? <CaseStudyGallery title={study.title} images={media.photography} /> : null}
      {!media.landscape && !media.vertical.length && !media.photography.length ? <p className="case-media__empty">Project media will be shared here when available.</p> : null}
      <VideoDialog project={project} onClose={() => setActive(null)} />
    </div>
  );
}
