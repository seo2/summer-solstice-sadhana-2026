"use client";

/**
 * Session list for the teacher full-profile page: day-grouped cards linking to
 * the program detail, each with a favorite toggle (local Dexie state).
 */

import { AppLink as Link } from "@/components/app-link";
import { Heart, MapPin } from "lucide-react";
import { useSavedActivities } from "@/lib/db";
import type { Activity } from "@/lib/types";
import { timeRange } from "@/lib/utils";

function formatDayLong(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export function TeacherSessions({ groups }: { groups: { date: string; items: Activity[] }[] }) {
  const { favoriteIds, toggleFavorite } = useSavedActivities();

  return (
    <>
      {groups.map((group) => (
        <div key={group.date}>
          <div className="mt-3 flex items-center gap-3 px-0.5 pb-1 pt-2">
            <span className="text-sm font-black text-[#2f62b6]">{formatDayLong(group.date)}</span>
            <div className="h-px flex-1 bg-sky-900/10" />
          </div>
          <div className="space-y-2.5">
            {group.items.map((session) => {
              const isFavorite = favoriteIds.has(session.id);
              return (
                <div key={session.id} className="activity-list-card rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/program/${session.id}`} className="min-w-0 flex-1 transition-transform duration-150 active:scale-[0.99]">
                      <p className="text-sm font-bold leading-tight text-[#f39200]">{timeRange(session.startTime, session.endTime)}</p>
                      <h3 className="mt-1 text-base font-black leading-snug text-slate-900">{session.title}</h3>
                    </Link>
                    <button
                      type="button"
                      aria-label={isFavorite ? `Remove ${session.title} from favorites` : `Add ${session.title} to favorites`}
                      onClick={() => toggleFavorite(session.id)}
                      className={`relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 transition-colors duration-150 ${
                        isFavorite ? "bg-rose-500 text-white ring-rose-400/40" : "bg-white text-slate-600 ring-sky-900/10"
                      }`}
                    >
                      <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <Link href={`/program/${session.id}`} className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                    {session.category && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800 ring-1 ring-amber-200/80">{session.category}</span>}
                    {session.location && <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-[#2f62b6] ring-1 ring-sky-200/80"><MapPin className="mr-1 h-3.5 w-3.5" />{session.location}</span>}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
