import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "global-static.popmart.com" },
      { protocol: "https", hostname: "prod-global-biz.popmart.com" },
      { protocol: "https", hostname: "prod-america-res.popmart.com" },
      { protocol: "https", hostname: "prod-eurasian-res.popmart.com" },
    ],
  },
};

export default nextConfig;
