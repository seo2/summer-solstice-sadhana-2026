"use client";

import { Heart } from "lucide-react";
import { useSavedActivities } from "@/lib/db";

export function ActivityActions({ activityId }: { activityId: string }) {
  const { favoriteIds, toggleFavorite } = useSavedActivities();
  const isFavorite = favoriteIds.has(activityId);

  return (
    <div className="pt-2">
      <button
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={() => toggleFavorite(activityId)}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black shadow-sm ring-1 transition active:scale-95 ${
          isFavorite
            ? "bg-rose-500 text-white ring-rose-400/40"
            : "bg-white text-slate-600 ring-sky-900/10"
        }`}
      >
        <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
        Favorite
      </button>
    </div>
  );
}
