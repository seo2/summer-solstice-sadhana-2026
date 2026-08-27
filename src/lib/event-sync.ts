"use client";

/**
 * Runtime sync client: refreshes every locally stored synced event against the
 * backend it was synced from (each record keeps its own baseUrl — the same
 * contract a future camp mirror will serve). Incremental via `since`; bundle
 * versions are only ever applied forward (monotonic per event). Silent on
 * network errors — offline is normal, the next trigger retries.
 */

import {
  getActiveEventSlug,
  listSyncedEvents,
  saveBundle,
  type SyncedBundle,
} from "@/lib/event-store";
import { CACHE_NAME } from "@/components/offline-preloader";

export type RefreshOutcome = {
  /** Slugs whose bundle actually changed and was saved. */
  updated: string[];
  /** True when the currently active event was among the updated ones. */
  activeUpdated: boolean;
};

type SyncResponse = SyncedBundle & { unchanged?: boolean };

export async function refreshSyncedEvents(): Promise<RefreshOutcome> {
  const outcome: RefreshOutcome = { updated: [], activeUpdated: false };
  if (typeof navigator !== "undefined" && !navigator.onLine) return outcome;

  const [events, activeSlug] = await Promise.all([listSyncedEvents(), getActiveEventSlug()]);

  for (const record of events) {
    try {
      const url = `${record.baseUrl}/wp-json/3ho-solstice/v1/sync?event=${encodeURIComponent(record.slug)}&since=${record.version}`;
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = (await response.json()) as SyncResponse;
      if (data.unchanged || typeof data.version !== "number") continue;
      // Monotonic guard: never apply an older bundle over a newer local one.
      if (data.version <= record.version) continue;
      await saveBundle(record.baseUrl, data);
      warmBundlePhotos(data).catch(() => {});
      outcome.updated.push(record.slug);
      if (record.slug === activeSlug) outcome.activeUpdated = true;
    } catch {
      // Unreachable backend or bad payload — keep the local copy, retry later.
    }
  }

  return outcome;
}

/**
 * Pre-cache the bundle's photos into the offline cache so teacher/program
 * images render with zero connectivity. Cross-origin photos (WordPress Media
 * Library) are stored as opaque responses; the service worker serves both from
 * the same cache. Best-effort — a failed photo never fails the sync.
 */
export async function warmBundlePhotos(bundle: SyncedBundle) {
  if (typeof caches === "undefined") return;

  const urls = new Set<string>();
  const collect = (raw: Record<string, unknown>) => {
    if (typeof raw.photo === "string" && raw.photo) urls.add(raw.photo);
    if (Array.isArray(raw.photos)) {
      for (const photo of raw.photos) if (typeof photo === "string" && photo) urls.add(photo);
    }
  };
  bundle.teachers.forEach(collect);
  bundle.program.forEach(collect);
  if (urls.size === 0) return;

  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    Array.from(urls, async (url) => {
      try {
        const absolute = new URL(url, window.location.origin);
        if (await cache.match(absolute.href)) return;
        const crossOrigin = absolute.origin !== window.location.origin;
        // cache.add() rejects opaque (status 0) responses, so fetch + put.
        const response = await fetch(absolute.href, crossOrigin ? { mode: "no-cors" } : undefined);
        if (response.ok || response.type === "opaque") {
          await cache.put(absolute.href, response);
        }
      } catch {
        // Missing or unreachable photo — the UI falls back to initials.
      }
    }),
  );
}
