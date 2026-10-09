"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDialog } from "@/components/media/use-dialog";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { PhotographyItem } from "@/types/media";

type PhotographyGalleryProps = { items: PhotographyItem[] };

export function PhotographyGallery({ items }: PhotographyGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const goTo = useCallback((index: number) => {
    const nextIndex = (index + items.length) % items.length;
    const slide = trackRef.current?.children[nextIndex] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
    setActiveIndex(nextIndex);
  }, [items.length, reduceMotion]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const lightboxRef = useDialog(lightboxIndex !== null, closeLightbox);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveIndex(Number((visible.target as HTMLElement).dataset.index));
    }, { root: track, threshold: [0.5, 0.75] });
    Array.from(track.children).forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleArrow = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setLightboxIndex((lightboxIndex + 1) % items.length);
      if (event.key === "ArrowLeft") setLightboxIndex((lightboxIndex - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", handleArrow);
    return () => document.removeEventListener("keydown", handleArrow);
  }, [items.length, lightboxIndex]);

  const lightboxItem = lightboxIndex === null ? null : items[lightboxIndex];

  return (
    <section id="photography" className="section section--photography" aria-labelledby="photography-title">
      <Reveal className="page-shell"><div id="photography-title"><SectionHeading eyebrow="Photography" title="Still moments with a sense of movement." description="Landscape, adventure and commercial imagery created on location." /></div></Reveal>
      <div className="gallery-controls page-shell">
        <p><span>{String(activeIndex + 1).padStart(2, "0")}</span> / {String(items.length).padStart(2, "0")}</p>
        <div>
          <button type="button" onClick={() => goTo(activeIndex - 1)} aria-label="Previous photograph">←</button>
          <button type="button" onClick={() => goTo(activeIndex + 1)} aria-label="Next photograph">→</button>
        </div>
      </div>
      <div ref={trackRef} className="photo-gallery" aria-label="Photography gallery">
        {items.map((item, index) => (
          <figure className="photo-slide" key={item.id} data-index={index}>
            <button type="button" className="photo-slide__button" onClick={() => setLightboxIndex(index)} aria-label={`Expand ${item.caption}`}>
              <span className="photo-slide__media" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
                {item.src ? (
                  <Image src={item.src} alt={item.alt} fill sizes="(min-width: 768px) 65vw, 88vw" />
                ) : (
                  <span className="photo-slide__placeholder" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></span>
                )}
              </span>
            </button>
            <figcaption><span>{item.caption}</span>{item.location ? <span>{item.location}</span> : null}</figcaption>
          </figure>
        ))}
      </div>

      <AnimatePresence>
        {lightboxItem ? (
          <motion.div className="lightbox" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="presentation">
            <div ref={lightboxRef} className="lightbox__inner" role="dialog" aria-modal="true" aria-label={`${lightboxItem.caption} expanded view`}>
              <button type="button" className="media-dialog__close" onClick={closeLightbox}>Close <span aria-hidden="true">×</span></button>
              <div className="lightbox__stage">
                {lightboxItem.src ? (
                  <Image src={lightboxItem.src} alt={lightboxItem.alt} fill sizes="100vw" />
                ) : (
                  <div className="photo-slide__placeholder"><span>{String(lightboxIndex! + 1).padStart(2, "0")}</span></div>
                )}
              </div>
              <div className="lightbox__footer">
                <p>{lightboxItem.caption}<small>{lightboxItem.location}</small></p>
                <div><button type="button" onClick={() => setLightboxIndex((lightboxIndex! - 1 + items.length) % items.length)} aria-label="Previous photograph">←</button><span>{lightboxIndex! + 1} / {items.length}</span><button type="button" onClick={() => setLightboxIndex((lightboxIndex! + 1) % items.length)} aria-label="Next photograph">→</button></div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
