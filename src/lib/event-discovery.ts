"use client";

/**
 * Event adoption: the app asks the backend which event is current and brings it
 * onto the device by itself.
 *
 * Without this there is no way for an attendee to ever get a new event: only
 * Sync Lab writes into the local store, and it is an internal screen the native
 * shell cannot even reach. Refreshing (event-sync.ts) only ever updates events
 * that are already stored.
 *
 * Two rules keep it from being annoying:
 *  - a deliberate choice in the event switcher wins (source "manual"), so the
 *    app never drags an attendee off the event they picked;
 *  - the built-in event needs no adoption — when the backend names it, the
 *    bundled content already covers it.
 */

import { apiUrl, getBackendBaseUrl } from "@/lib/backend";
import { BUILTIN_EVENT_SLUG } from "@/lib/messages";
import {
  getActiveEventSlug,
  getActiveEventSource,
  listSyncedEvents,
  saveBundle,
  setActiveEvent,
  type SyncedBundle,
} from "@/lib/event-store";
import { warmBundlePhotos } from "@/lib/event-sync";

export type AdoptionOutcome =
  | { adopted: false; reason: "offline" | "unavailable" | "manual" | "builtin" | "already-active" }
  | { adopted: true; slug: string; name: string; downloaded: boolean };

type CurrentEventResponse = {
  ok?: boolean;
  slug?: string;
  name?: string;
};

/**
 * Ask the backend for the current event and make it the active one. Silent on
 * every failure — offline is normal and the built-in event always works.
 */
export async function adoptCurrentEvent(): Promise<AdoptionOutcome> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { adopted: false, reason: "offline" };
  }

  // A deliberate choice outranks whatever the backend considers current.
  if ((await getActiveEventSource()) === "manual") {
    return { adopted: false, reason: "manual" };
  }

  let current: CurrentEventResponse;

  try {
    const response = await fetch(apiUrl("events/current"));
    if (!response.ok) return { adopted: false, reason: "unavailable" };
    current = (await response.json()) as CurrentEventResponse;
  } catch {
    return { adopted: false, reason: "unavailable" };
  }

  const slug = typeof current.slug === "string" ? current.slug : "";

  if (!slug) return { adopted: false, reason: "unavailable" };

  // The bundled content already is this event; activating a synced copy would
  // only duplicate it.
  if (slug === BUILTIN_EVENT_SLUG) return { adopted: false, reason: "builtin" };

  if ((await getActiveEventSlug()) === slug) {
    return { adopted: false, reason: "already-active" };
  }

  const base = getBackendBaseUrl();
  const stored = await listSyncedEvents();
  const known = stored.find((record) => record.slug === slug);
  let downloaded = false;

  if (!known) {
    let bundle: SyncedBundle;

    try {
      const response = await fetch(`${base}/wp-json/3ho-solstice/v1/sync?event=${encodeURIComponent(slug)}`);
      if (!response.ok) return { adopted: false, reason: "unavailable" };
      bundle = (await response.json()) as SyncedBundle;
    } catch {
      return { adopted: false, reason: "unavailable" };
    }

    if (!bundle?.event?.slug || typeof bundle.version !== "number") {
      return { adopted: false, reason: "unavailable" };
    }

    await saveBundle(base, bundle);
    // Best effort: teacher and map images for the first offline session.
    warmBundlePhotos(bundle).catch(() => {});
    downloaded = true;
  }

  await setActiveEvent(slug, "auto");

  return {
    adopted: true,
    slug,
    name: current.name ?? known?.name ?? slug,
    downloaded,
  };
}
