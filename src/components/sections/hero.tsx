"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HeroMedia } from "@/components/media/hero-media";
import { VideoDialog } from "@/components/media/video-dialog";
import type { HeroMedia as HeroMediaData, PortfolioProject } from "@/types/media";

export function Hero({ media: heroMedia }: { media: HeroMediaData }) {
  const [showreelOpen, setShowreelOpen] = useState(false);
  const showreelProject = useMemo<PortfolioProject | null>(() => heroMedia.showreel || heroMedia.showreelUrl ? ({
    id: "showreel",
    title: "WtRB Media showreel",
    clientType: "WtRB Media",
    category: "Showreel",
    description: "Selected outdoor film and photography production.",
    aspectRatio: "16:9",
    poster: heroMedia.poster,
    video: heroMedia.showreel ?? { src: heroMedia.showreelUrl!, type: "video/mp4" },
  }) : null, [heroMedia]);

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <HeroMedia media={heroMedia} onPlayShowreel={() => setShowreelOpen(true)} />
      <div className="hero__shade" />
      <div className="hero__content page-shell">
        <p className="hero__kicker">Creative production &amp; content marketing</p>
        <h1 id="hero-title" className="hero__title">Stories worth watching.<br /><span>Campaigns built to work.</span></h1>
        <div className="hero__footer">
          <div><p className="hero__lead">Film-led marketing for brands that move people.</p><p className="hero__support">We combine creative strategy, cinematic filmmaking, photography and content marketing to help travel, outdoor and experience-led brands connect with their audiences and inspire action.</p></div>
          <div className="hero__actions">
            <Link className="button button--light" href="#work">Explore our work</Link>
            <Link className="text-link" href="#contact">Start a project <span aria-hidden="true">↘</span></Link>
          </div>
        </div>
      </div>
      <a className="hero__scroll" href="#work"><span>Scroll to explore</span><span aria-hidden="true">↓</span></a>
      <VideoDialog project={showreelOpen ? showreelProject : null} onClose={() => setShowreelOpen(false)} />
    </section>
  );
}
