"use client";

/**
 * Map tab: the built-in Ram Das Puri map (with legend pins) for the built-in
 * event; the active synced event's own venue map (bundle `event.mapImage`,
 * pre-cached offline at sync time) when one is active, with pins for every
 * venue that carries a `mapPoint`. A synced event without a published map
 * shows its venue list instead of the wrong campground.
 */

import { MapPinOff } from "lucide-react";
import { legendFromVenues, MapViewer } from "./map-viewer";
import { ActiveEventBanner } from "@/components/active-event-banner";
import { bundleMapImage, bundleVenues, useActiveSyncedEvent } from "@/lib/event-store";

export default function MapPage() {
  const synced = useActiveSyncedEvent();

  if (synced) {
    const mapImage = bundleMapImage(synced.bundle);
    const venues = bundleVenues(synced.bundle);

    if (mapImage) {
      return (
        <div className="space-y-4">
          <ActiveEventBanner />
          <MapViewer
            src={mapImage}
            legend={legendFromVenues(venues)}
            alt={`Venue map for ${synced.name}`}
            eyebrow={synced.bundle.event.location ?? synced.name}
            title="Venue orientation"
          />
        </div>
      );
    }

    // Landmarks (restrooms, parking…) only make sense on a map.
    const listed = venues.filter((venue) => venue.kind !== "landmark");

    return (
      <div className="space-y-4">
        <ActiveEventBanner />
        <div className="rounded-2xl border border-sky-900/10 bg-white p-6 text-center shadow-sm">
          <MapPinOff className="mx-auto h-8 w-8 text-sky-200" aria-hidden />
          <p className="mt-3 text-sm font-bold text-stone-600">Venue map not published yet</p>
          <p className="mt-1 text-xs font-semibold text-stone-400">
            The map for {synced.name} will appear here once the event team publishes it.
          </p>
        </div>
        {listed.length > 0 && (
          <div className="space-y-2">
            <h2 className="px-1 text-sm font-bold uppercase tracking-[0.18em] text-[#f39200]">Venues</h2>
            {listed.map((venue) => (
              <div key={venue.id} className="rounded-xl border border-sky-900/10 bg-white p-4 shadow-sm">
                <p className="text-sm font-black text-slate-950">{venue.name}</p>
                {venue.description && <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{venue.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <MapViewer />;
}
