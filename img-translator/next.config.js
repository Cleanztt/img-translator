/** @type {import('next').NextConfig} */
const nextConfig = {
  // 关闭静态优化以测试
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', '127.0.0.1', 'vercel.app'],
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
  // 确保在Vercel上正确部署
  output: 'standalone',
  // 处理API路由
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      }
    ];
  }
};

module.exports = nextConfig; 