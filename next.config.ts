/** @type {import('next').NextConfig} */
const BACKEND_URL = 'https://cbt-simulator-backend.vercel.app';

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        // Proxy all /api/* requests through Next.js server to the backend.
        // This eliminates cross-origin (CORS) issues entirely — the browser
        // only ever talks to the same origin (einsteinsadmin.vercel.app).
        // Cookies are set for this domain, fixing login on all devices
        // including iOS Safari (which blocks third-party cookies via ITP).
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
}

export default nextConfig