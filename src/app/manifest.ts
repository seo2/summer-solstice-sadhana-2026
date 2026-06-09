import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "3HO Summer Solstice Sadhana 2026",
    short_name: "Summer Solstice 2026",
    description: "Offline-first program, favorites and personal agenda for Summer Solstice Sadhana 2026.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff8ef",
    theme_color: "#d78b4a",
    categories: ["education", "lifestyle", "travel"],
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
