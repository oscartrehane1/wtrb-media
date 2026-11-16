"use client";

import Image from "next/image";
import { useState } from "react";
import { isPublicationGatedImage } from "@/lib/project-images";

export function PortfolioThumbnail({ poster, featured, category, sizes }: { poster: string | null; featured?: boolean; category: string; sizes?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <>
      <span className="portfolio-project__placeholder" aria-hidden="true"><span>{category}</span></span>
      {poster && failed !== poster ? <Image src={poster} alt="" fill unoptimized={isPublicationGatedImage(poster)} sizes={sizes ?? (featured ? "(min-width: 1200px) 62vw, (min-width: 768px) 65vw, 90vw" : "(min-width: 1200px) 40vw, (min-width: 768px) 45vw, 90vw")} onError={() => setFailed(poster)} /> : null}
    </>
  );
}
