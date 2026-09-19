import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // `domains` is deprecated in favour of `remotePatterns` (which also lets
    // us scope Unsplash to its image CDN path instead of the whole host).
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
