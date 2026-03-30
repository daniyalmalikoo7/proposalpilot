import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse and mammoth require Node.js native APIs — must not be bundled
  serverExternalPackages: ["pdf-parse", "mammoth"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
