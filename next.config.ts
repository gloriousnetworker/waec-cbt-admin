/** @type {import('next').NextConfig} */
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
  // API proxy is handled by src/app/api/[...path]/route.js
  // (rewrites don't re-map Set-Cookie domain — the route handler does)
}

export default nextConfig