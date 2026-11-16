import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 60,
    localPatterns: [
      { pathname: "/media/**", search: "" },
      { pathname: "/opengraph-image", search: "" },
      // Only these exact server-authenticated paths may use upload-version queries.
      ...["showreel", "work-02", "work-03", "work-04"].flatMap((slot) =>
        ["jpg", "webp"].map((extension) => ({ pathname: `/api/thumbnails/${slot}.${extension}` })),
      ),
      // The image route itself validates canonical project names and formats.
      ...["work-02", "work-03", "work-04"].flatMap((slot) =>
        ["jpg", "webp"].map((extension) => ({ pathname: `/api/thumbnails/${slot}-*.${extension}` })),
      ),
    ],
  },
};

export default nextConfig;
