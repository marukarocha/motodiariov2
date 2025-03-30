import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora erros do ESLint durante o build
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbopack: false,
  },
  
};

export default nextConfig;
