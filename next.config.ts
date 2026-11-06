
import type { NextConfig } from "next";

const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    // Near-static content: services, dentists, site settings
    content: { stale: 300, revalidate: 3600, expire: 86400 },
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
  },
  async headers() {
    return [
      { source: "/admin/:path*", headers: noindex },
      { source: "/api/:path*", headers: noindex },
      {
        // Token links must never be indexed or leaked through the Referer header
        source: "/manage/:path*",
        headers: [...noindex, { key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;

