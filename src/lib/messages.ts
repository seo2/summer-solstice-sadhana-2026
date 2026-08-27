"use client";

/**
 * Messaging phase 3a client: official Announcements + urgent Alerts feed.
 * Polling-first against the WordPress plugin's public-read broadcast endpoints
 * (`/updates` cheap combined poll, `/channels/{id}/messages?since=`). Messages
 * are stored locally (Dexie) so the feed reads offline; the read cursor is
 * local too, so everything works logged out. Shapes mirror
 * `class-ssa-messages.php` exactly.
 */

import Dexie, { type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { getBackendBaseUrl } from "@/lib/backend";

export const BUILTIN_EVENT_SLUG = "summer-solstice-2026";

export type BroadcastMessage = {
  /** `${eventSlug}:${id}` — Dexie primary key. */
  gid: string;
  eventSlug: string;
  id: number;
  channelId: number;
  channelType: "official" | "alert";
  channelName: string;
  kind: string;
  body: string;
  authorName: string;
  createdAt: string | null;
};

type MessagesState = { key: string; value: number };

class MessagesDatabase extends Dexie {
  messages!: Table<BroadcastMessage, string>;
  state!: Table<MessagesState, string>;

  constructor() {
    super("solstice-messages");
    this.version(1).stores({
      messages: "gid, [eventSlug+id], eventSlug",
      state: "key",
    });
  }
}

const messagesDb = new MessagesDatabase();

const cursorKey = (eventSlug: string) => `cursor:${eventSlug}`;
const lastReadKey = (eventSlug: string) => `lastRead:${eventSlug}`;

async function getState(key: string): Promise<number> {
  const row = await messagesDb.state.get(key);
  return row?.value ?? 0;
}

type UpdatesChannel = {
  id: number;
  type: "official" | "alert";
  name: string;
  lastMessageId: number;
  newCount: number;
};

type UpdatesResponse = { ok: boolean; cursor: number; contentVersion: number; channels: UpdatesChannel[] };

type HistoryResponse = {
  ok: boolean;
  channel: { id: number; type: "official" | "alert"; name: string };
  messages: { id: number; kind: string; body: string; authorName: string; createdAt: string | null }[];
  cursor: number;
};

/**
 * One poll cycle for an event: cheap `/updates` first, message bodies only for
 * channels that actually have something new. Returns how many new messages
 * were stored. Silent on network errors — offline is normal, next poll retries.
 */
export async function refreshBroadcasts(baseUrl: string, eventSlug: string): Promise<number> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0;

  const base = baseUrl.replace(/\/$/, "");
  const since = await getState(cursorKey(eventSlug));

  const updatesResponse = await fetch(
    `${base}/wp-json/3ho-solstice/v1/updates?event=${encodeURIComponent(eventSlug)}&since=${since}`,
  );
  if (!updatesResponse.ok) return 0;
  const updates = (await updatesResponse.json()) as UpdatesResponse;
  if (!updates.ok || !Array.isArray(updates.channels)) return 0;

  let stored = 0;
  for (const channel of updates.channels) {
    if (!channel.newCount) continue;
    const historyResponse = await fetch(
      `${base}/wp-json/3ho-solstice/v1/channels/${channel.id}/messages?since=${since}&limit=100`,
    );
    if (!historyResponse.ok) continue;
    const history = (await historyResponse.json()) as HistoryResponse;
    if (!history.ok || !Array.isArray(history.messages)) continue;

    await messagesDb.messages.bulkPut(
      history.messages.map((message) => ({
        gid: `${eventSlug}:${message.id}`,
        eventSlug,
        id: message.id,
        channelId: channel.id,
        channelType: channel.type,
        channelName: channel.name,
        kind: message.kind,
        body: message.body,
        authorName: message.authorName,
        createdAt: message.createdAt,
      })),
    );
    stored += history.messages.length;
  }

  if (typeof updates.cursor === "number" && updates.cursor > since) {
    await messagesDb.state.put({ key: cursorKey(eventSlug), value: updates.cursor });
  }

  return stored;
}

/** Feed for one event, newest first. */
export function useBroadcasts(eventSlug: string): BroadcastMessage[] {
  return useLiveQuery(
    () => messagesDb.messages.where("eventSlug").equals(eventSlug).reverse().sortBy("id"),
    [eventSlug],
    [],
  );
}

/** Messages newer than the locally tracked read cursor. */
export function useUnreadCount(eventSlug: string): number {
  return (
    useLiveQuery(
      async () => {
        const lastRead = await getState(lastReadKey(eventSlug));
        return messagesDb.messages
          .where("[eventSlug+id]")
          .between([eventSlug, lastRead + 1], [eventSlug, Dexie.maxKey])
          .count();
      },
      [eventSlug],
      0,
    ) ?? 0
  );
}

/** Called when the feed is viewed — clears the unread badge. */
export async function markBroadcastsRead(eventSlug: string) {
  const newest = await messagesDb.messages.where("eventSlug").equals(eventSlug).reverse().sortBy("id");
  const maxId = newest[0]?.id ?? 0;
  const lastRead = await getState(lastReadKey(eventSlug));
  if (maxId > lastRead) {
    await messagesDb.state.put({ key: lastReadKey(eventSlug), value: maxId });
  }
}

/**
 * The messaging context for the currently active event: the active synced
 * event polls its own backend; the built-in event polls the shared backend
 * origin under its production slug.
 */
export function broadcastContext(active: { slug: string; baseUrl: string } | null | undefined) {
  if (active) return { eventSlug: active.slug, baseUrl: active.baseUrl };
  return { eventSlug: BUILTIN_EVENT_SLUG, baseUrl: getBackendBaseUrl() };
}
