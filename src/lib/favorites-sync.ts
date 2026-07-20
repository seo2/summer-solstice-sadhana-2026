"use client";

/**
 * Favorites sync against the backend (`POST /sync`, bearer auth). Strategy per
 * docs/ACCOUNTS.md: merge the server copy into local on the first sync after
 * login (never destructive), then push local state — upserts for favorites,
 * `deleted: true` for tombstones — with last-write-wins on the server.
 *
 * v1 limitation: only built-in event activities sync (the local store doesn't
 * record which event an id belongs to; agenda rows are event-scoped).
 */

import program from "@/data/program.json";
import { apiUrl } from "@/lib/backend";
import { db } from "@/lib/db";
import { getSession, updateSession } from "@/lib/auth";
import type { Activity } from "@/lib/types";

const BUILTIN_EVENT_SLUG = "summer-solstice-2026";

const builtinIds = new Set((program as Activity[]).map((activity) => activity.id));

type AgendaWireItem = {
  programItemId: string;
  kind: string;
  updatedAt: string | null;
  deleted: boolean;
};

type SyncResponse = {
  ok: boolean;
  message?: string;
  agenda?: AgendaWireItem[];
};

async function postAgenda(token: string, agenda: AgendaWireItem[]): Promise<SyncResponse> {
  const response = await fetch(apiUrl("sync"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ event: BUILTIN_EVENT_SLUG, agenda }),
  });

  const data = (await response.json().catch(() => ({}))) as SyncResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.message || `Sync failed (HTTP ${response.status}).`);
  }

  return data;
}

/**
 * Full reconciliation. Returns the number of favorites after syncing, or null
 * when not logged in.
 */
export async function syncFavorites(): Promise<number | null> {
  const session = await getSession();
  if (!session) return null;

  const favorites = await db.favorites.toArray();
  const tombstones = await db.favoriteTombstones.toArray();

  const upserts: AgendaWireItem[] = favorites
    .filter((favorite) => builtinIds.has(favorite.activityId))
    .map((favorite) => ({
      programItemId: favorite.activityId,
      kind: "favorite",
      updatedAt: favorite.createdAt,
      deleted: false,
    }));

  const deletions: AgendaWireItem[] = tombstones
    .filter((tombstone) => builtinIds.has(tombstone.activityId))
    .map((tombstone) => ({
      programItemId: tombstone.activityId,
      kind: "favorite",
      updatedAt: tombstone.deletedAt,
      deleted: true,
    }));

  const data = await postAgenda(session.token, [...upserts, ...deletions]);
  const serverAgenda = (data.agenda ?? []).filter((item) => item.kind === "favorite");

  // First sync after login: union the server's favorites into the local store
  // so a fresh device picks up what other devices saved.
  if (!session.mergedFavoritesAt) {
    const localIds = new Set(favorites.map((favorite) => favorite.activityId));
    const tombstoneIds = new Set(tombstones.map((tombstone) => tombstone.activityId));

    for (const item of serverAgenda) {
      if (item.deleted || localIds.has(item.programItemId) || tombstoneIds.has(item.programItemId)) continue;
      if (!builtinIds.has(item.programItemId)) continue;
      await db.favorites.put({
        activityId: item.programItemId,
        createdAt: item.updatedAt ?? new Date().toISOString(),
      });
    }

    await updateSession({ mergedFavoritesAt: new Date().toISOString() });
  }

  await updateSession({ lastSyncAt: new Date().toISOString() });

  return db.favorites.count();
}
