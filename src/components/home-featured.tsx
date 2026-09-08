"use client";

/**
 * Home "Featured": landings published for everyone (no event scope) plus any
 * pinned landing, as tiles above News & posts — the place for what 3HO wants
 * every attendee to see next (a training, a retreat, a save-the-date), from
 * the local store so it renders offline. Nothing until a landing exists.
 */

import { Sparkles } from "lucide-react";
import { LandingTile } from "@/components/landing-tile";
import { useHomeLandings } from "@/lib/home-feed";
import { builtinLandings, featuredLandings, mergeLandings } from "@/lib/landings";

export function HomeFeatured() {
  const synced = useHomeLandings() ?? [];
  const featured = featuredLandings(mergeLandings(builtinLandings, synced));

  if (featured.length === 0) return null;

  return (
    <section aria-labelledby="home-featured-title">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-[#f39200]" aria-hidden />
        <h2 id="home-featured-title" className="text-xs font-black uppercase tracking-[0.18em] text-[#f39200]">
          Featured
        </h2>
      </div>

      <div className="mt-3 space-y-3">
        {featured.map((landing) => (
          <LandingTile key={landing.id} landing={landing} />
        ))}
      </div>
    </section>
  );
}
