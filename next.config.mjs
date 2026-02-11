/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  serverComponentsExternalPackages: ['bcryptjs', 'ldapjs-promise', 'ldapjs'],
};

export default nextConfig;

