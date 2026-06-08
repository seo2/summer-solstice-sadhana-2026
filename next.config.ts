import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.destination === "document" || request.destination === "script" || request.destination === "style" || request.destination === "image" || request.url.includes("/data/"),
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "solstice-app-shell",
          expiration: { maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default withPWA(nextConfig);
