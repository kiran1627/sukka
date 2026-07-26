import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},

  // Transpile Three.js packages
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/postprocessing',
  ],

  // Experimental features
  experimental: {
    optimizePackageImports: ['three', 'gsap', 'howler'],
  },
};

export default nextConfig;
