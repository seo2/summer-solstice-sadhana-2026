"use client";

/**
 * Runtime sync client: refreshes every locally stored synced event against the
 * backend it was synced from (each record keeps its own baseUrl — the same
 * contract a future camp mirror will serve). Incremental via `since`; bundle
 * versions are only ever applied forward (monotonic per event). Silent on
 * network errors — offline is normal, the next trigger retries.
 */

import {
  bundleActivities,
  getActiveEventSlug,
  listSyncedEvents,
  saveBundle,
  type SyncedBundle,
} from "@/lib/event-store";
import { listFavoriteIds } from "@/lib/db";
import { CACHE_NAME } from "@/components/offline-preloader";

export type RefreshOutcome = {
  /** Slugs whose bundle actually changed and was saved. */
  updated: string[];
  /** True when the currently active event was among the updated ones. */
  activeUpdated: boolean;
  /** Human-readable notices for favorited sessions that changed (N2b). */
  favoriteChanges: string[];
};

function formatWhen(activity: { date: string; startTime: string }): string {
  const start = new Date(`${activity.date}T${activity.startTime}:00`);
  if (Number.isNaN(start.getTime())) return `${activity.date} ${activity.startTime}`;
  return start.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

/**
 * Diff the user's favorited sessions between the old and new bundle: a move in
 * time, a venue change, or a removal each produce one notice. Computed fully
 * on-device — works logged out, no per-user server targeting.
 */
function favoriteChangeNotices(
  oldBundle: SyncedBundle,
  newBundle: SyncedBundle,
  favoriteIds: Set<string>,
): string[] {
  const after = new Map(bundleActivities(newBundle).map((activity) => [activity.id, activity]));
  const notices: string[] = [];

  for (const previous of bundleActivities(oldBundle)) {
    if (!favoriteIds.has(previous.id)) continue;
    const next = after.get(previous.id);
    if (!next) {
      notices.push(`"${previous.title}" is no longer on the program.`);
      continue;
    }
    const timeChanged = previous.date !== next.date || previous.startTime !== next.startTime;
    const placeChanged = (previous.location ?? "") !== (next.location ?? "") && !!next.location;
    if (timeChanged && placeChanged) {
      notices.push(`"${next.title}" moved to ${formatWhen(next)} · ${next.location}.`);
    } else if (timeChanged) {
      notices.push(`"${next.title}" moved to ${formatWhen(next)}.`);
    } else if (placeChanged) {
      notices.push(`"${next.title}" moved to ${next.location}.`);
    }
  }

  return notices;
}

type SyncResponse = SyncedBundle & { unchanged?: boolean };

export async function refreshSyncedEvents(): Promise<RefreshOutcome> {
  const outcome: RefreshOutcome = { updated: [], activeUpdated: false, favoriteChanges: [] };
  if (typeof navigator !== "undefined" && !navigator.onLine) return outcome;

  const [events, activeSlug, favoriteIds] = await Promise.all([
    listSyncedEvents(),
    getActiveEventSlug(),
    listFavoriteIds(),
  ]);

  for (const record of events) {
    try {
      const url = `${record.baseUrl}/wp-json/3ho-solstice/v1/sync?event=${encodeURIComponent(record.slug)}&since=${record.version}`;
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = (await response.json()) as SyncResponse;
      if (data.unchanged || typeof data.version !== "number") continue;
      // Monotonic guard: never apply an older bundle over a newer local one.
      if (data.version <= record.version) continue;
      outcome.favoriteChanges.push(...favoriteChangeNotices(record.bundle, data, favoriteIds));
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
 * images render with zero connectivity. Best-effort — a failed photo never
 * fails the sync.
 */
export async function warmBundlePhotos(bundle: SyncedBundle) {
  const urls = new Set<string>();
  const collect = (raw: Record<string, unknown>) => {
    if (typeof raw.photo === "string" && raw.photo) urls.add(raw.photo);
    if (Array.isArray(raw.photos)) {
      for (const photo of raw.photos) if (typeof photo === "string" && photo) urls.add(photo);
    }
  };
  bundle.teachers.forEach(collect);
  bundle.program.forEach(collect);
  if (typeof bundle.event.mapImage === "string" && bundle.event.mapImage) {
    urls.add(bundle.event.mapImage);
  }
  await warmImageUrls(urls);
}

/**
 * Store remote images in the offline cache. Cross-origin images (WordPress
 * Media Library) are stored as opaque responses; the service worker serves
 * both from the same cache. Shared by bundle photos and the home feed's
 * covers and post images.
 */
export async function warmImageUrls(urls: Iterable<string>) {
  if (typeof caches === "undefined") return;
  const unique = Array.from(new Set(Array.from(urls).filter(Boolean)));
  if (unique.length === 0) return;

  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    unique.map(async (url) => {
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
        // Missing or unreachable image — the UI falls back gracefully.
      }
    }),
  );
}
