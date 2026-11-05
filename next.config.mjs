/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Baremetal deploy: the CI stages .next/standalone + static + public.
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Property photography is served by the API's media endpoint; the host is
      // build-time config because next/image validates it at compile time.
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME ?? 'stayin-api.solvin.id',
        pathname: '/api/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9130',
        pathname: '/api/media/**',
      },
    ],
  },
};

export default nextConfig;
