import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  /* config options here */
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
  },

};

export default nextConfig;
