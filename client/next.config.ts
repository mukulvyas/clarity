import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from external domains if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Enable React strict mode for better error detection
  reactStrictMode: true,
};

export default nextConfig;
