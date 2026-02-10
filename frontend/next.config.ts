import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver l'indicateur de développement Next.js et autres logos
  devIndicators: {
    position: "bottom-right"
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.finnhub.io',
        pathname: '/logo/**',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'financialmodelingprep.com',
        pathname: '/image-stock/**',
      },
    ],
  },
};

export default nextConfig;
