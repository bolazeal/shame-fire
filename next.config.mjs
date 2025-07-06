/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // These settings are helpful for debugging build issues.
  // They prevent the build from failing on TypeScript or ESLint errors.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
