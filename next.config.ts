import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    // In production, redirect non-landing pages to maintenance if PRODUCTION_MODE is set
    const isProductionMode = process.env.PRODUCTION_MODE === 'landing_only';
    if (isProductionMode) {
      return [
        {
          source: '/listings/:path*',
          destination: '/maintenance',
          permanent: false,
        },
        {
          source: '/profile/:path*',
          destination: '/maintenance',
          permanent: false,
        },
        {
          source: '/register',
          destination: '/maintenance',
          permanent: false,
        },
        {
          source: '/login',
          destination: '/maintenance',
          permanent: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
