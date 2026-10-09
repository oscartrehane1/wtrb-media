"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HeroMedia } from "@/components/media/hero-media";
import { VideoDialog } from "@/components/media/video-dialog";
import { heroMedia } from "@/content/portfolio";
import type { PortfolioProject } from "@/types/media";

export function Hero() {
  const [showreelOpen, setShowreelOpen] = useState(false);
  const showreelProject = useMemo<PortfolioProject | null>(() => heroMedia.showreelUrl ? ({
    id: "showreel",
    title: "WtRB Media showreel",
    clientType: "WtRB Media",
    category: "Showreel",
    description: "Selected outdoor film and photography production.",
    aspectRatio: "16:9",
    poster: heroMedia.poster,
    video: { src: heroMedia.showreelUrl, type: "video/mp4" },
  }) : null, []);

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <HeroMedia media={heroMedia} onPlayShowreel={() => setShowreelOpen(true)} />
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
      <VideoDialog project={showreelOpen ? showreelProject : null} onClose={() => setShowreelOpen(false)} />
    </section>
  );
}
