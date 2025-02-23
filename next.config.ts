import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignora erros de build de TypeScript (não recomendado para produção)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora erros do ESLint durante o build
    ignoreDuringBuilds: true,
  },
  
};

export default nextConfig;
