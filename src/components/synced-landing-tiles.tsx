"use client";

/**
 * Landing tiles from the Home feed store for the event being viewed: every
 * synced landing scoped to that event. While the built-in event is active the
 * built-in tiles are already server-rendered next to this component, so a
 * synced landing repeating a built-in id is skipped (the backend can still add
 * new landings to the built-in event without an app release). Renders nothing
 * until the store has something.
 */

import { LandingTile } from "@/components/landing-tile";
import { BUILTIN_EVENT_SLUG } from "@/lib/builtin-event";
import { useActiveSyncedEvent } from "@/lib/event-store";
import { useHomeLandings } from "@/lib/home-feed";
import { builtinLandings, landingsForEvent } from "@/lib/landings";

export function SyncedLandingTiles() {
  const synced = useActiveSyncedEvent();
  const landings = useHomeLandings() ?? [];
  const slug = synced ? synced.slug : BUILTIN_EVENT_SLUG;
  const builtinIds = new Set(builtinLandings.map((landing) => landing.id));
  const list = landingsForEvent(landings, slug).filter((landing) => synced || !builtinIds.has(landing.id));

  if (list.length === 0) return null;

  return (
    <>
      {list.map((landing) => (
        <LandingTile key={landing.id} landing={landing} />
      ))}
    </>
  );
}
