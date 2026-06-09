import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const OFFLINE_CACHE = "solstice-full-offline-v21";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  cacheOnFrontEndNav: false,
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === "navigate" || request.destination === "document",
        handler: "NetworkFirst",
        options: {
          cacheName: OFFLINE_CACHE,
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: ({ request, url }) =>
          request.destination === "script" ||
          request.destination === "style" ||
          request.destination === "image" ||
          url.pathname === "/manifest.webmanifest",
        handler: "CacheFirst",
        options: {
          cacheName: OFFLINE_CACHE,
          expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
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
