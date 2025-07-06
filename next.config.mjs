/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // In a real app, you would add your Firebase Storage hostname here
      // e.g., { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }
    ],
  },
};

export default nextConfig;
