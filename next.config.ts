import { statSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const OFFLINE_CACHE = "solstice-full-offline-v67";

/**
 * Android only initializes Firebase when `android/app/google-services.json` is
 * present and non-empty — `android/app/build.gradle` applies the
 * google-services plugin under exactly this condition. The web layer must know
 * at build time, because calling PushNotifications.register() without FCM
 * throws on Capacitor's native plugin thread and kills the process (no JS
 * catch can intercept it). Mirror the Gradle check here.
 */
function fcmConfigured() {
  try {
    return statSync(join(process.cwd(), "android", "app", "google-services.json")).size > 0;
  } catch {
    return false;
  }
}

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
          url.pathname.endsWith(".txt") ||
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
  outputFileTracingRoot: process.cwd(),
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_FCM_CONFIGURED: fcmConfigured() ? "1" : "" },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default withPWA(nextConfig);
