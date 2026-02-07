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
        hostname: 'www.blick.ch',
      },
      {
        protocol: 'https',
        hostname: 'img.nzz.ch',
      },
      {
        protocol: 'https',
        hostname: 'www.nzz.ch',
      },
      {
        protocol: 'https',
        hostname: '*.blick.ch',
      },
    ],
  },
};

export default nextConfig;
