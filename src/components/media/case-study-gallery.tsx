"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useDialog } from "@/components/media/use-dialog";
import type { CaseStudyPhoto } from "@/types/media";

export function CaseStudyGallery({ title, images }: { title: string; images: CaseStudyPhoto[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [failed, setFailed] = useState<string[]>([]);
  const close = useCallback(() => setActive(null), []);
  const dialogRef = useDialog(active !== null, close);
  const current = active === null ? null : images[active];
  const image = (item: CaseStudyPhoto, expanded = false) => failed.includes(item.src)
    ? <span className="case-photos__unavailable">Image unavailable</span>
    : <Image src={item.src} alt={item.alt} fill loading="lazy" sizes={expanded || images.length === 1 || (images.length % 3 === 0 && item.id === images[0].id) ? "90vw" : "(min-width: 1200px) 45vw, (min-width: 768px) 48vw, 90vw"} onError={() => setFailed((previous) => previous.includes(item.src) ? previous : [...previous, item.src])} />;

  return (
    <section className="case-media__section" aria-labelledby="project-photography-title">
      <h2 id="project-photography-title">Photography</h2>
      <div className="case-photos">
        {images.map((item, index) => <figure key={item.id}>
          <button className="case-photos__button" type="button" onClick={() => setActive(index)} aria-label={`Expand ${item.caption} — ${title}`}>
            {image(item)}<span className="case-photos__expand" aria-hidden="true">↗</span>
          </button><figcaption>{item.caption}</figcaption>
        </figure>)}
      </div>
      {current ? <div className="lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="lightbox__inner" ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${title} — ${current.caption}`} onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            setActive((index) => ((index ?? 0) + (event.key === "ArrowRight" ? 1 : images.length - 1)) % images.length);
          }
        }}>
          <button className="media-dialog__close" type="button" onClick={close} aria-label="Close photograph">Close <span aria-hidden="true">×</span></button>
          <div className="case-photos__expanded" key={current.src}>{image(current, true)}</div>
          <div className="lightbox__footer">
            <p aria-live="polite">{current.caption}<small>{(active ?? 0) + 1} / {images.length}</small></p>
            <div><button className="icon-button" type="button" aria-label="Previous project photograph" disabled={images.length < 2} onClick={() => setActive(((active ?? 0) + images.length - 1) % images.length)}>←</button><button className="icon-button" type="button" aria-label="Next project photograph" disabled={images.length < 2} onClick={() => setActive(((active ?? 0) + 1) % images.length)}>→</button></div>
          </div>
        </div>
      </div> : null}
    </section>
  );
}
