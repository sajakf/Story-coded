import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // allows any external image URL (OpenRouter CDN varies by model)
  },
};

export default nextConfig;
