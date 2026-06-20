import type { NextConfig } from "next";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:8002";

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
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
