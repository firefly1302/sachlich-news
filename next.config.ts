import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.srf.ch',
      },
      {
        protocol: 'https',
        hostname: 'www.20min.ch',
      },
      {
        protocol: 'https',
        hostname: '*.20min.ch',
      },
    ],
  },
};

export default nextConfig;
