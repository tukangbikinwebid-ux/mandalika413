import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sbclbzad8s.ufs.sh",
        pathname: "/**",
      },
    ],
    domains: [
      "api-topup.naditechno.id",
      "images.unsplash.com",
      "sbclbzad8s.ufs.sh",
    ],
  },
};

export default nextConfig;
