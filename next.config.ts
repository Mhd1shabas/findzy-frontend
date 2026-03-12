import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.1.36:3000", "findzy-frontend.vercel.app"]
    }
  },

  async redirects() {
    return [
      {
        source: "/providers",
        destination: "/browse-services",
        permanent: true,
      },
      {
        source: "/explore",
        destination: "/browse-services",
        permanent: true,
      },
      {
        source: "/services",
        destination: "/browse-services",
        permanent: true,
      },
      {
        source: "/search",
        destination: "/browse-services",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;