"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroMedia as HeroMediaConfig, MediaSource } from "@/types/media";

type HeroMediaProps = {
  media: HeroMediaConfig;
  onPlayShowreel?: () => void;
};

export function HeroMedia({ media, onPlayShowreel }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<MediaSource | null>(null);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const selectSource = () => {
      setFailed(false);
      if (reducedMotion.matches) {
        setSource(null);
        setSoundEnabled(false);
        videoRef.current?.pause();
        return;
      }
      setSource(mobile.matches ? media.mobile ?? media.desktop : media.desktop ?? media.mobile);
    };

    selectSource();
    mobile.addEventListener("change", selectSource);
    reducedMotion.addEventListener("change", selectSource);
    return () => {
      mobile.removeEventListener("change", selectSource);
      reducedMotion.removeEventListener("change", selectSource);
    };
  }, [media.desktop, media.mobile]);

  useEffect(() => {
    if (!source || !videoRef.current) return;
    videoRef.current.load();
    videoRef.current.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
  }, [source]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextSoundEnabled = !soundEnabled;
    video.muted = !nextSoundEnabled;
    setSoundEnabled(nextSoundEnabled);
    video.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
  };

  return (
    <>
      <div className="hero__media" aria-hidden="true">
        {media.poster ? <div className="hero__poster" style={{ backgroundImage: `url("${media.poster}")` }} /> : null}
        {source && !failed ? (
          <video
            key={source.src}
            ref={videoRef}
            className="hero__video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={media.poster ?? undefined}
            onError={() => setFailed(true)}
          >
            <source src={source.src} type={source.type} />
          </video>
        ) : null}
        {!source || failed || blocked ? (
          <>
            <div className="hero__media-grid" />
            <span className="hero__media-label">{failed ? "Showreel unavailable" : "Cinematic media placeholder"}</span>
          </>
        ) : null}
      </div>
      {source && !failed ? (
        <button type="button" className="hero__sound" onClick={toggleSound} aria-pressed={soundEnabled}>
          <span aria-hidden="true">{soundEnabled ? "◖))" : "◖×"}</span>
          {soundEnabled ? "Sound on" : "Sound off"}
        </button>
      ) : null}
      {media.showreelUrl && onPlayShowreel ? (
        <button type="button" className="hero__play" onClick={onPlayShowreel} aria-label="Play showreel with sound">
          <span aria-hidden="true">▶</span> Play showreel
        </button>
      ) : null}
    </>
  );
}
