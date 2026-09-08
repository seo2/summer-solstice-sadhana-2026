import { LandingView } from "@/components/landing-view";
import { builtinLanding } from "@/lib/landings";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * A Woman's Renewal Experience — the first landing, rendered from
 * src/data/landings.json through the shared template. Kept at its own static
 * route so it stays in the offline preload list and old links keep working.
 */

export const metadata: Metadata = {
  title: "A Woman's Renewal Experience | 3HO Summer Solstice 2026",
  description: "Offline-friendly event details and registration reminder for A Woman's Renewal Experience, June 29-July 1, 2026.",
};

export default function WomensRenewalPage() {
  const landing = builtinLanding("womens-renewal-2026");
  if (!landing) notFound();
  return <LandingView landing={landing} />;
}
