import type { NextConfig } from "next";

// Allow next/image to optimise pictures stored in your Supabase Storage bucket.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      // Instagram / Facebook CDN for the live feed
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },
  experimental: {
    // Commission requests may include a few (client-side compressed) reference images.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
