/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
            protocol: 'https',
            hostname: 'placehold.co',
        },
        {
            protocol: 'https',
            hostname: 'storage.googleapis.com',
        }
      ],
    },
  };
  
  export default nextConfig;
  