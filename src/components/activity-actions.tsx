"use client";

import { Heart, Star } from "lucide-react";
import { useSavedActivities } from "@/lib/db";

export function ActivityActions({ activityId }: { activityId: string }) {
  const { favoriteIds, agendaIds, toggleFavorite, toggleAgenda } = useSavedActivities();
  const isFavorite = favoriteIds.has(activityId);
  const isAgenda = agendaIds.has(activityId);

  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={() => toggleFavorite(activityId)}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black shadow-sm ring-1 transition active:scale-95 ${
          isFavorite
            ? "bg-rose-500 text-white ring-rose-400/40"
            : "bg-white text-slate-600 ring-sky-900/10"
        }`}
      >
        <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
        Favorite
      </button>
      <button
        type="button"
        aria-label={isAgenda ? "Remove from agenda" : "Add to agenda"}
        onClick={() => toggleAgenda(activityId)}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black shadow-sm ring-1 transition active:scale-95 ${
          isAgenda
            ? "bg-[#f39200] text-white ring-orange-300/60"
            : "bg-white text-slate-600 ring-sky-900/10"
        }`}
      >
        <Star className="h-5 w-5" fill={isAgenda ? "currentColor" : "none"} />
        My Agenda
      </button>
    </div>
  );
}
