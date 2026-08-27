"use client";

import Dexie, { type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

type SavedActivity = {
  activityId: string;
  createdAt: string;
};

export type ContactMessageStatus = "queued" | "sending" | "sent" | "failed";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  status: ContactMessageStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string;
  sentAt?: string;
  error?: string;
};

type FavoriteTombstone = {
  activityId: string;
  deletedAt: string;
};

class SolsticeDatabase extends Dexie {
  favorites!: Table<SavedActivity, string>;
  contactMessages!: Table<ContactMessage, string>;
  favoriteTombstones!: Table<FavoriteTombstone, string>;

  constructor() {
    super("summer-solstice-sadhana-2026");
    this.version(1).stores({
      favorites: "activityId, createdAt",
      agenda: "activityId, createdAt",
    });
    this.version(2).stores({
      favorites: "activityId, createdAt",
      agenda: "activityId, createdAt",
      contactMessages: "id, status, createdAt, updatedAt",
    });
    // v3: tombstones so favorite deletions can sync to the backend (LWW).
    this.version(3).stores({
      favorites: "activityId, createdAt",
      agenda: "activityId, createdAt",
      contactMessages: "id, status, createdAt, updatedAt",
      favoriteTombstones: "activityId, deletedAt",
    });
  }
}

export const db = new SolsticeDatabase();

async function toggle(table: Table<SavedActivity, string>, activityId: string) {
  const existing = await table.get(activityId);
  if (existing) {
    await table.delete(activityId);
    await db.favoriteTombstones.put({ activityId, deletedAt: new Date().toISOString() });
    return false;
  }
  await table.put({ activityId, createdAt: new Date().toISOString() });
  await db.favoriteTombstones.delete(activityId);
  return true;
}

/** Plain (non-hook) accessor for background agents. */
export async function listFavoriteIds(): Promise<Set<string>> {
  const rows = await db.favorites.toArray();
  return new Set(rows.map((row) => row.activityId));
}

export function useSavedActivities() {
  const favorites = useLiveQuery(() => db.favorites.toArray(), [], []);
  const favoriteIds = new Set(favorites.map((item) => item.activityId));

  return {
    favoriteIds,
    toggleFavorite: (activityId: string) => toggle(db.favorites, activityId),
  };
}

export function useContactMessages() {
  return useLiveQuery(() => db.contactMessages.orderBy("createdAt").reverse().toArray(), [], []);
}
