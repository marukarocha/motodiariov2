import type { NextConfig } from "next";
import withPWA from "next-pwa";

// Configuração do plugin PWA separada
const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Nenhuma config pwa aqui!
};

// Combina as configs com o plugin
export default withPWAConfig(nextConfig);
