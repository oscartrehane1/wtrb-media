"use client";

import Image from "next/image";
import { useState } from "react";

export function PortfolioThumbnail({ poster, featured, category }: { poster: string | null; featured?: boolean; category: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <>
      <span className="portfolio-project__placeholder" aria-hidden="true"><span>{category}</span></span>
      {poster && failed !== poster ? <Image src={poster} alt="" fill sizes={featured ? "(min-width: 1200px) 62vw, (min-width: 768px) 65vw, 90vw" : "(min-width: 1200px) 40vw, (min-width: 768px) 45vw, 90vw"} onError={() => setFailed(poster)} /> : null}
    </>
  );
}
