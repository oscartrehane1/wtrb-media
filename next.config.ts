import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { minimumCacheTTL: 60 },
};

export default nextConfig;
