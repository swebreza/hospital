import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Disable TypeScript type checking during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during build (optional)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
