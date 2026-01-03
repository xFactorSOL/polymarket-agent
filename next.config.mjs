/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API routes are in /api folder (handled by Vercel)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
