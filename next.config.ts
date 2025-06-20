import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development", // desativa PWA em dev
  },
};

export default withPWA(config);
