import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    // In production, redirect non-landing pages to maintenance if PRODUCTION_MODE is set
    if (process.env.NODE_ENV === 'production' && process.env.PRODUCTION_MODE === 'landing_only') {
      return [
        {
          source: '/((?!^/$|_next|static|favicon.ico|maintenance|api).*)',
          destination: '/maintenance',
          permanent: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
