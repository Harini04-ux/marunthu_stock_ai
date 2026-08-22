import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://marunthu-stock-ai-backend.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
