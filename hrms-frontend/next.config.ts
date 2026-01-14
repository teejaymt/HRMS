import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Optimize font loading and suppress preload warnings
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {},
};

export default nextConfig;
