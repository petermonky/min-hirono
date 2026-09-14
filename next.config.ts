import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "global-static.popmart.com" },
      { protocol: "https", hostname: "prod-global-biz.popmart.com" },
      { protocol: "https", hostname: "prod-america-res.popmart.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
