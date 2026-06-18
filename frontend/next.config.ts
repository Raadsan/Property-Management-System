import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_S3_BUCKET || "radsanuploads"}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || "eu-north-1"}.amazonaws.com`,
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8002/api/:path*',
        // destination: 'http://178.18.241.5:8002/api/:path*',
      },
    ];
  },
};

export default nextConfig;
