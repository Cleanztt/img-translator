/** @type {import('next').NextConfig} */
const nextConfig = {
  // 关闭静态优化以测试
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 确保开发服务器正确配置
  devIndicators: {
    buildActivity: true,
  },
};

module.exports = nextConfig; 