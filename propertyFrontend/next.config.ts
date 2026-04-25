import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://178.18.241.5:8002/api/:path*',
      },
    ];
  },
};

export default nextConfig;
