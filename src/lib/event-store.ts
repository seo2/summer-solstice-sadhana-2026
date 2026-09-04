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
    mapImage?: string | null;
  };
  program: Record<string, unknown>[];
  teachers: Record<string, unknown>[];
  venues: ({ id: string; name: string; description?: string } & Record<string, unknown>)[];
  categories: { id: string; name: string }[];
  infoPages?: ({ id: string; title: string; content?: string } & Record<string, unknown>)[];
  menus?: Record<string, unknown>[];
};

/** Info page from the bundle; `group` / `sort` / `featured` are optional editorial hints (plugin P7). */
export type SyncedInfoPage = { id: string; title: string; content: string; group?: string; sort?: number; featured?: boolean };

export type MenuDay = {
  id: string;
  date: string;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  title?: string;
  items: string[];
  notes?: string;
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
/**
 * Whether the active event was picked by the attendee or adopted automatically.
 * Auto-adoption must never override a deliberate choice in the event switcher,
 * so it only acts while this is absent or "auto".
 */
const ACTIVE_EVENT_SOURCE_KEY = "active-event-source";

export type ActiveEventSource = "manual" | "auto";

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

export async function setActiveEvent(slug: string | null, source: ActiveEventSource = "manual") {
  if (slug) {
    await eventDb.settings.put({ key: ACTIVE_EVENT_KEY, value: slug });
  } else {
    await eventDb.settings.delete(ACTIVE_EVENT_KEY);
  }

  await eventDb.settings.put({ key: ACTIVE_EVENT_SOURCE_KEY, value: source });
}

/** "manual" once the attendee has chosen an event (or the built-in) themselves. */
export async function getActiveEventSource(): Promise<ActiveEventSource> {
  const setting = await eventDb.settings.get(ACTIVE_EVENT_SOURCE_KEY);

  return setting?.value === "manual" ? "manual" : "auto";
}

/** All locally stored synced events, most recently saved first. */
export function useSyncedEvents(): SyncedEventRecord[] {
  return useLiveQuery(() => eventDb.syncedEvents.orderBy("savedAt").reverse().toArray(), [], []);
}

/** Plain (non-hook) accessors for background agents. */
export async function listSyncedEvents(): Promise<SyncedEventRecord[]> {
  return eventDb.syncedEvents.toArray();
}

export async function getActiveEventSlug(): Promise<string | null> {
  const setting = await eventDb.settings.get(ACTIVE_EVENT_KEY);
  return setting?.value ?? null;
}

export async function removeSyncedEvent(slug: string) {
  const setting = await eventDb.settings.get(ACTIVE_EVENT_KEY);
  if (setting?.value === slug) {
    await eventDb.settings.delete(ACTIVE_EVENT_KEY);
  }
  await eventDb.syncedEvents.delete(slug);
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

const VENUE_KINDS = new Set(["venue", "landmark"]);

function percent(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100 ? value : undefined;
}

/**
 * Venues with their optional map placement (`mapPoint` in percent of the map
 * image, `color`, `number`, `featured` rank, `kind`). Malformed map fields are
 * dropped field-by-field — the venue itself always survives.
 */
export function bundleVenues(bundle: SyncedBundle): Venue[] {
  return bundle.venues.map((raw) => {
    const venue: Venue = { id: raw.id, name: raw.name, description: raw.description };
    const point = raw.mapPoint as { x?: unknown; y?: unknown } | undefined;
    const x = percent(point?.x);
    const y = percent(point?.y);
    if (x !== undefined && y !== undefined) venue.mapPoint = { x, y };
    const color = str(raw.color);
    if (color) venue.color = color;
    if (typeof raw.number === "number" && Number.isInteger(raw.number) && raw.number > 0) venue.number = raw.number;
    if (typeof raw.featured === "number" && Number.isFinite(raw.featured)) venue.featured = raw.featured;
    else if (raw.featured === true) venue.featured = Number.MAX_SAFE_INTEGER;
    const kind = str(raw.kind);
    if (kind && VENUE_KINDS.has(kind)) venue.kind = kind as Venue["kind"];
    return venue;
  });
}

export function bundleCategories(bundle: SyncedBundle): Category[] {
  return bundle.categories.map((category) => ({ id: category.id, name: category.name }));
}

export function bundleInfoPages(bundle: SyncedBundle): SyncedInfoPage[] {
  const pages: SyncedInfoPage[] = [];
  for (const raw of bundle.infoPages ?? []) {
    const id = str(raw.id);
    const title = str(raw.title);
    const content = typeof raw.content === "string" ? raw.content : "";
    if (!id || !title) continue;
    const page: SyncedInfoPage = { id, title, content };
    const group = str(raw.group);
    if (group) page.group = group;
    if (typeof raw.sort === "number" && Number.isFinite(raw.sort)) page.sort = raw.sort;
    if (raw.featured === true || raw.featured === 1) page.featured = true;
    pages.push(page);
  }
  return pages;
}

const MEALS = new Set(["breakfast", "lunch", "dinner", "snack"]);

export function bundleMenus(bundle: SyncedBundle): MenuDay[] {
  const menus: MenuDay[] = [];
  for (const raw of bundle.menus ?? []) {
    const id = str(raw.id);
    const date = str(raw.date);
    const meal = str(raw.meal);
    if (!id || !date || !meal || !MEALS.has(meal)) continue;
    menus.push({
      id,
      date,
      meal: meal as MenuDay["meal"],
      title: str(raw.title),
      items: strArray(raw.items) ?? [],
      notes: str(raw.notes),
    });
  }
  return menus;
}

export function bundleMapImage(bundle: SyncedBundle): string | undefined {
  return typeof bundle.event.mapImage === "string" && bundle.event.mapImage ? bundle.event.mapImage : undefined;
}
