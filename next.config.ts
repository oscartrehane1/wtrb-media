import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 60,
    localPatterns: [
      { pathname: "/**", search: "" },
      // Only these exact server-authenticated paths may use upload-version queries.
      ...["showreel", "work-01", "work-02", "work-03", "work-04"].flatMap((slot) =>
        ["jpg", "webp"].map((extension) => ({ pathname: `/api/thumbnails/${slot}.${extension}` })),
      ),
    ],
  },
};

export default nextConfig;
