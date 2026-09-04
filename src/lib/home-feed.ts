"use client";

/**
 * Home feed: the catalog of events the backend publishes plus staff-authored
 * posts (news, calls to register, notices that are not urgent alerts). One
 * public endpoint, `GET /home`, fetched in the background and stored in
 * IndexedDB so the Home screen renders it offline. Independent of the active
 * event: this is the *app's* home, the sync bundle is one event's content.
 *
 * Shapes are the contract proposed in docs/HOME.md and served verbatim by
 * scripts/mock-backend.mjs; normalizers drop malformed items silently, like
 * the bundle normalizers in event-store.ts.
 */

import Dexie, { type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { apiUrl } from "@/lib/backend";
import { BUILTIN_EVENT_SLUG } from "@/lib/messages";
import { warmImageUrls } from "@/lib/event-sync";
import type { SyncedEventRecord } from "@/lib/event-store";

export type HomeEvent = {
  slug: string;
  name: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  timezone?: string;
  status?: string;
  /** One line under the name, e.g. the event's theme. */
  summary?: string;
  /** Cover image URL (Media Library); optional. */
  cover?: string;
  /** Where to buy a ticket — the app links out, never sells (ROADMAP Phase 5). */
  registrationUrl?: string;
  /** Bundle content version, informational. */
  version?: number;
};

export type HomePost = {
  id: string;
  title: string;
  /** Plain text in the info-page grammar (see plain-text.ts). */
  body: string;
  image?: string;
  linkUrl?: string;
  linkLabel?: string;
  /** Undefined = for everyone; otherwise shown only while that event is active. */
  eventSlug?: string;
  pinned: boolean;
  publishedAt: string | null;
};

type FeedState = { key: string; value: string };

class HomeFeedDatabase extends Dexie {
  events!: Table<HomeEvent, string>;
  posts!: Table<HomePost, string>;
  state!: Table<FeedState, string>;

  constructor() {
    super("solstice-home-feed");
    this.version(1).stores({
      events: "slug, startDate",
      posts: "id, eventSlug, publishedAt",
      state: "key",
    });
  }
}

const homeDb = new HomeFeedDatabase();

const FETCHED_AT_KEY = "fetchedAt";

/**
 * The bundled event as a catalog entry, so the Home list is complete even
 * before the backend has ever answered (and forever, offline).
 */
export const BUILTIN_HOME_EVENT: HomeEvent = {
  slug: BUILTIN_EVENT_SLUG,
  name: "Summer Solstice Sadhana 2026",
  startDate: "2026-06-19",
  endDate: "2026-06-27",
  location: "Ram Das Puri, New Mexico",
  timezone: "America/Denver",
  summary: "Chardi Kala · A Celebration of Joy",
};

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

const isoDate = (value: unknown): string | undefined => {
  const text = str(value);
  return text && /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : undefined;
};

function normalizeEvent(raw: unknown): HomeEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const slug = str(item.slug);
  const name = str(item.name);
  if (!slug || !name) return null;

  return {
    slug,
    name,
    startDate: isoDate(item.startDate),
    endDate: isoDate(item.endDate),
    location: str(item.location),
    timezone: str(item.timezone),
    status: str(item.status),
    summary: str(item.summary),
    cover: str(item.cover),
    registrationUrl: str(item.registrationUrl),
    version: typeof item.version === "number" ? item.version : undefined,
  };
}

function normalizePost(raw: unknown): HomePost | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = str(item.id);
  const title = str(item.title);
  if (!id || !title) return null;

  return {
    id,
    title,
    body: typeof item.body === "string" ? item.body : "",
    image: str(item.image),
    linkUrl: str(item.linkUrl),
    linkLabel: str(item.linkLabel),
    eventSlug: str(item.eventSlug),
    pinned: item.pinned === true,
    publishedAt: str(item.publishedAt) ?? null,
  };
}

type HomeFeedResponse = { ok?: boolean; events?: unknown; posts?: unknown };

/**
 * One refresh: fetch the whole feed (it is small — a handful of events and a
 * few dozen posts) and replace the local copy. Returns true when a feed was
 * stored. Silent on every failure — offline is normal, the next tick retries.
 */
export async function refreshHomeFeed(): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return false;

  let data: HomeFeedResponse;

  try {
    const response = await fetch(apiUrl("home"));
    if (!response.ok) return false;
    data = (await response.json()) as HomeFeedResponse;
  } catch {
    return false;
  }

  if (!data || data.ok === false || !Array.isArray(data.events) || !Array.isArray(data.posts)) return false;

  const events = data.events.map(normalizeEvent).filter((event): event is HomeEvent => event !== null);
  const posts = data.posts.map(normalizePost).filter((post): post is HomePost => post !== null);

  await homeDb.transaction("rw", homeDb.events, homeDb.posts, homeDb.state, async () => {
    await homeDb.events.clear();
    await homeDb.events.bulkPut(events);
    await homeDb.posts.clear();
    await homeDb.posts.bulkPut(posts);
    await homeDb.state.put({ key: FETCHED_AT_KEY, value: new Date().toISOString() });
  });

  // Best effort: covers and post images for the next offline session.
  const images = [...events.map((event) => event.cover), ...posts.map((post) => post.image)].filter(
    (url): url is string => typeof url === "string",
  );
  warmImageUrls(images).catch(() => {});

  return true;
}

/** Catalog events as last fetched (empty until the backend has answered once). */
export function useHomeEvents(): HomeEvent[] {
  return useLiveQuery(() => homeDb.events.toArray(), [], []);
}

/** Every stored post, unsorted and unscoped — see visiblePosts(). */
export function useHomePosts(): HomePost[] {
  return useLiveQuery(() => homeDb.posts.toArray(), [], []);
}

/** ISO timestamp of the last successful refresh, or null. */
export function useHomeFeedFetchedAt(): string | null {
  return useLiveQuery(async () => (await homeDb.state.get(FETCHED_AT_KEY))?.value ?? null, [], null);
}

export type EventPhase = "live" | "upcoming" | "past" | "unscheduled";

export function localToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Where an event sits relative to today, by calendar date (no time zones involved). */
export function eventPhase(event: { startDate?: string; endDate?: string }, today = localToday()): EventPhase {
  if (!event.startDate) return "unscheduled";
  const end = event.endDate ?? event.startDate;
  if (event.startDate <= today && end >= today) return "live";
  if (event.startDate > today) return "upcoming";
  return "past";
}

const monthShort = (date: Date) => date.toLocaleDateString("en-US", { month: "short" });

const DAY_MS = 86_400_000;

/** Whole days from `from` to `to` (both YYYY-MM-DD), DST-proof via UTC. */
function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
}

/**
 * The one line that makes a date feel close: "In 102 days", "Starts
 * tomorrow", "Day 3 of 7", "Ended Jun 27". Null without a start date.
 */
export function eventCountdown(event: { startDate?: string; endDate?: string }, today = localToday()): string | null {
  if (!event.startDate) return null;
  const end = event.endDate ?? event.startDate;
  const phase = eventPhase(event, today);

  if (phase === "upcoming") {
    const days = daysBetween(today, event.startDate);
    return days === 1 ? "Starts tomorrow" : `In ${days} days`;
  }
  if (phase === "live") {
    const total = daysBetween(event.startDate, end) + 1;
    const day = daysBetween(event.startDate, today) + 1;
    return total > 1 ? `Day ${day} of ${total}` : "Today";
  }
  const ended = new Date(`${end}T12:00:00`);
  return Number.isNaN(ended.getTime()) ? null : `Ended ${monthShort(ended)} ${ended.getDate()}`;
}

export type HomeEventEntry = HomeEvent & {
  /** The bundled Summer Solstice content — always available, never removable. */
  builtin: boolean;
  /** Bundle present on this device, so it opens offline. */
  downloaded: boolean;
  phase: EventPhase;
};

const PHASE_RANK: Record<EventPhase, number> = { live: 0, upcoming: 1, past: 2, unscheduled: 3 };

/**
 * The Home list: catalog events, the built-in event (catalog fields win when
 * the backend publishes it too) and any locally synced event the catalog no
 * longer lists. Archived events are hidden. Order: happening now, then
 * upcoming soonest first, then past most recent first; within a phase the
 * event being viewed (`activeSlug`) comes first, so "continue" is one tap.
 */
export function mergeHomeEvents(
  catalog: HomeEvent[],
  synced: SyncedEventRecord[],
  activeSlug: string = BUILTIN_EVENT_SLUG,
  today = localToday(),
): HomeEventEntry[] {
  const bySlug = new Map<string, HomeEvent>();
  for (const event of catalog) bySlug.set(event.slug, event);

  const downloaded = new Set(synced.map((record) => record.slug));

  const entries: HomeEventEntry[] = [];

  const builtinCatalog = bySlug.get(BUILTIN_EVENT_SLUG);
  entries.push({
    ...BUILTIN_HOME_EVENT,
    ...(builtinCatalog ?? {}),
    slug: BUILTIN_EVENT_SLUG,
    builtin: true,
    downloaded: true,
    phase: eventPhase(builtinCatalog ?? BUILTIN_HOME_EVENT, today),
  });
  bySlug.delete(BUILTIN_EVENT_SLUG);

  for (const event of bySlug.values()) {
    if (event.status === "archived") continue;
    entries.push({ ...event, builtin: false, downloaded: downloaded.has(event.slug), phase: eventPhase(event, today) });
  }

  for (const record of synced) {
    if (record.slug === BUILTIN_EVENT_SLUG || bySlug.has(record.slug)) continue;
    const { event } = record.bundle;
    if (event.status === "archived") continue;
    const entry: HomeEvent = {
      slug: record.slug,
      name: record.name,
      startDate: isoDate(event.startDate),
      endDate: isoDate(event.endDate),
      location: str(event.location),
      timezone: str(event.timezone),
      status: str(event.status),
      version: record.version,
    };
    entries.push({ ...entry, builtin: false, downloaded: true, phase: eventPhase(entry, today) });
  }

  entries.sort((a, b) => {
    const rank = PHASE_RANK[a.phase] - PHASE_RANK[b.phase];
    if (rank !== 0) return rank;
    if ((a.slug === activeSlug) !== (b.slug === activeSlug)) return a.slug === activeSlug ? -1 : 1;
    if (a.phase === "past") return (b.endDate ?? b.startDate ?? "").localeCompare(a.endDate ?? a.startDate ?? "");
    return (a.startDate ?? "").localeCompare(b.startDate ?? "") || a.name.localeCompare(b.name);
  });

  return entries;
}

/**
 * Posts for the event being viewed: everyone's posts plus the ones scoped to
 * that event. Pinned first, then newest first.
 */
export function visiblePosts(posts: HomePost[], activeSlug: string): HomePost[] {
  return posts
    .filter((post) => !post.eventSlug || post.eventSlug === activeSlug)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const when = (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
      return when !== 0 ? when : a.id.localeCompare(b.id);
    });
}

/** "Jun 19–27, 2026" · "Dec 15 – Jan 2, 2027" · "Dec 20, 2026". */
export function formatEventDates(start?: string, end?: string): string | null {
  if (!start) return null;
  const from = new Date(`${start}T12:00:00`);
  if (Number.isNaN(from.getTime())) return null;
  const to = end ? new Date(`${end}T12:00:00`) : null;

  if (to && !Number.isNaN(to.getTime()) && end !== start) {
    if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
      return `${monthShort(from)} ${from.getDate()}–${to.getDate()}, ${to.getFullYear()}`;
    }
    return `${monthShort(from)} ${from.getDate()} – ${monthShort(to)} ${to.getDate()}, ${to.getFullYear()}`;
  }

  return `${monthShort(from)} ${from.getDate()}, ${from.getFullYear()}`;
}

/** "Sep 1, 2026" — posts carry a timestamp, the day is what matters. */
export function formatPostDate(publishedAt: string | null): string {
  if (!publishedAt) return "";
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
