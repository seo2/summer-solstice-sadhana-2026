import { LandingPage } from "@/components/landing-page";
import type { Metadata } from "next";

/**
 * The shared page for landings that have no static route of their own — the
 * ones the backend publishes in the Home feed. Which landing is in the URL
 * hash (`/landing#<id>`), read on the client; the export ships this shell and
 * the offline preloader caches it, so it opens without a connection.
 */

export const metadata: Metadata = {
  title: "Featured | 3HO Event App",
  description: "Retreats, trainings and special days from 3HO — details saved on your device.",
};

export default function Page() {
  return <LandingPage />;
}
