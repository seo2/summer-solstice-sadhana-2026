"use client";

/**
 * Local store for synced event bundles (from the WordPress 3ho-solstice-app
 * backend) and the "active event" selection. The built-in Summer Solstice
 * 2026 content (bundled JSON) always remains available: activating a synced
 * event swaps what Program/Favorites/Teachers render, deactivating restores
 * the built-in event. Everything lives in IndexedDB — fully offline once synced.
 */

import Dexie, { type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import type { Activity, Category, Teacher, Venue } from "@/lib/types";

export type SyncedBundle = {
  version: number;
  event: {
    slug: string;
    name: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    timezone?: string;
    status?: string;
  };
  program: Record<string, unknown>[];
  teachers: Record<string, unknown>[];
  venues: { id: string; name: string; description?: string }[];
  categories: { id: string; name: string }[];
  infoPages?: { id: string; title: string; content?: string }[];
};

export type SyncedEventRecord = {
  slug: string;
  name: string;
  version: number;
  savedAt: string;
  baseUrl: string;
  bundle: SyncedBundle;
};

type Setting = { key: string; value: string };

class EventStoreDatabase extends Dexie {
  syncedEvents!: Table<SyncedEventRecord, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super("solstice-event-store");
    this.version(1).stores({
      syncedEvents: "slug, savedAt",
      settings: "key",
    });
  }
}

const eventDb = new EventStoreDatabase();

const ACTIVE_EVENT_KEY = "active-event";

export async function saveBundle(baseUrl: string, bundle: SyncedBundle) {
  await eventDb.syncedEvents.put({
    slug: bundle.event.slug,
    name: bundle.event.name,
    version: bundle.version,
    savedAt: new Date().toISOString(),
    baseUrl,
    bundle,
  });
}

export async function setActiveEvent(slug: string | null) {
  if (slug) {
    await eventDb.settings.put({ key: ACTIVE_EVENT_KEY, value: slug });
  } else {
    await eventDb.settings.delete(ACTIVE_EVENT_KEY);
  }
}

/**
 * The active synced event record, or null when the built-in event is active.
 * `undefined` while loading (callers should render the built-in content and
 * let the synced one hydrate in — avoids flashes and hydration mismatches).
 */
export function useActiveSyncedEvent(): SyncedEventRecord | null | undefined {
  return useLiveQuery(async () => {
    const setting = await eventDb.settings.get(ACTIVE_EVENT_KEY);
    if (!setting?.value) return null;
    const record = await eventDb.syncedEvents.get(setting.value);
    return record ?? null;
  }, []);
}

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value !== "" ? value : undefined;

const strArray = (value: unknown): string[] | undefined =>
  Array.isArray(value) && value.every((item) => typeof item === "string") && value.length > 0
    ? (value as string[])
    : undefined;

/** Map bundle program items (backend shape) to the app's Activity type. */
export function bundleActivities(bundle: SyncedBundle): Activity[] {
  const items: Activity[] = [];

  for (const raw of bundle.program) {
    const id = str(raw.id);
    const date = str(raw.date);
    const startTime = str(raw.startTime);
    const title = str(raw.title);
    if (!id || !date || !startTime || !title) continue;

    items.push({
      id,
      date,
      day: str(raw.day) ?? "",
      startTime,
      endTime: str(raw.endTime),
      title,
      category: str(raw.category),
      tags: strArray(raw.tags),
      location: str(raw.location),
      facilitator: str(raw.facilitator),
      country: str(raw.country),
      language: str(raw.language),
      description: str(raw.description),
      photo: str(raw.photo),
      photos: strArray(raw.photos),
    });
  }

  return items;
}

/** Map bundle teachers (backend shape) to the app's Teacher type. */
export function bundleTeachers(bundle: SyncedBundle): Teacher[] {
  const teachers: Teacher[] = [];

  for (const raw of bundle.teachers) {
    const id = str(raw.id);
    const name = str(raw.name);
    if (!id || !name) continue;

    teachers.push({
      id,
      name,
      facilitatorNames: strArray(raw.facilitatorNames) ?? [name],
      bio: str(raw.bio) ?? "",
      country: str(raw.country),
      photo: str(raw.photo),
      photos: strArray(raw.photos),
    });
  }

  return teachers;
}

export function bundleVenues(bundle: SyncedBundle): Venue[] {
  return bundle.venues.map((venue) => ({ id: venue.id, name: venue.name, description: venue.description }));
}

export function bundleCategories(bundle: SyncedBundle): Category[] {
  return bundle.categories.map((category) => ({ id: category.id, name: category.name }));
}
