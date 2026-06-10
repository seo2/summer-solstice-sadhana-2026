"use client";

import Dexie, { type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

type SavedActivity = {
  activityId: string;
  createdAt: string;
};

class SolsticeDatabase extends Dexie {
  favorites!: Table<SavedActivity, string>;

  constructor() {
    super("summer-solstice-sadhana-2026");
    this.version(1).stores({
      favorites: "activityId, createdAt",
      agenda: "activityId, createdAt",
    });
  }
}

export const db = new SolsticeDatabase();

async function toggle(table: Table<SavedActivity, string>, activityId: string) {
  const existing = await table.get(activityId);
  if (existing) {
    await table.delete(activityId);
    return false;
  }
  await table.put({ activityId, createdAt: new Date().toISOString() });
  return true;
}

export function useSavedActivities() {
  const favorites = useLiveQuery(() => db.favorites.toArray(), [], []);
  const favoriteIds = new Set(favorites.map((item) => item.activityId));

  return {
    favoriteIds,
    toggleFavorite: (activityId: string) => toggle(db.favorites, activityId),
  };
}
