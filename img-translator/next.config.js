/** @type {import('next').NextConfig} */
const nextConfig = {
  // 关闭静态优化以测试
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['*'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig; 