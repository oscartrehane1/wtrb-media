"use client";

import Image from "next/image";
import { useState } from "react";
import { VideoDialog } from "@/components/media/video-dialog";
import type { CaseStudy, PortfolioProject } from "@/types/media";

export function CaseStudyMedia({ study }: { study: CaseStudy }) {
  const [open, setOpen] = useState(false);
  const playable = Boolean(study.media.youtubeVideoId || study.media.film);
  const project: PortfolioProject = {
    id: study.slug,
    title: study.title,
    clientType: study.classification,
    category: study.sector,
    description: study.summary,
    aspectRatio: "16:9",
    poster: study.media.poster,
    video: study.media.film,
    youtubeVideoId: study.media.youtubeVideoId,
  };

  return (
    <>
      <div className="case-study__media page-shell" aria-label={playable ? `${study.title} campaign film` : "Campaign film placeholder"}>
        {study.media.poster ? <Image src={study.media.poster} alt="" fill sizes="100vw" /> : null}
        <div className="case-study__media-label"><span>Landscape campaign film</span><strong>{playable ? "Watch film" : "In development"}</strong></div>
        {playable ? <button className="button button--light" type="button" onClick={() => setOpen(true)}>Play campaign film</button> : null}
      </div>
      <VideoDialog project={open ? project : null} onClose={() => setOpen(false)} />
    </>
  );
}
