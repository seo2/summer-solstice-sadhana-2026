"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Search } from "lucide-react";
import { AppLink as Link } from "@/components/app-link";
import { ActivityCard } from "@/components/activity-card";
import { useSavedActivities } from "@/lib/db";
import type { Activity, Category, Venue } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const formatDayLabel = (date: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00`));

type Mode = "all" | "favorites";

export function ProgramExplorer({ activities, venues, categories, mode = "all" }: { activities: Activity[]; venues: Venue[]; categories: Category[]; mode?: Mode }) {
  const { favoriteIds, toggleFavorite } = useSavedActivities();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("all");
  const [venue, setVenue] = useState("all");
  const [category, setCategory] = useState("all");
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterHeight, setFilterHeight] = useState(0);

  useEffect(() => {
    const el = filterRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setFilterHeight(el.offsetHeight));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const dates = useMemo(() => Array.from(new Set(activities.map((item) => item.date))).sort(), [activities]);
  const savedCount = mode === "favorites" ? favoriteIds.size : activities.length;

  // On the main program view, default to the current day if it falls within the
  // event so attendees land on today's schedule without scrolling. Runs once on
  // mount (client only) to avoid static-export hydration mismatches.
  const appliedDefaultDay = useRef(false);
  useEffect(() => {
    if (appliedDefaultDay.current || mode !== "all") return;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (dates.includes(todayStr)) setDate(todayStr);
    appliedDefaultDay.current = true;
  }, [dates, mode]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activities
      .filter((item) => (mode === "favorites" ? favoriteIds.has(item.id) : true))
      .filter((item) => (date === "all" ? true : item.date === date))
      .filter((item) => (venue === "all" ? true : item.location === venue))
      .filter((item) => (category === "all" ? true : item.category === category))
      .filter((item) => {
        if (!q) return true;
        return [
          item.title,
          item.description,
          item.facilitator,
          item.location,
          item.category,
          ...(item.tags ?? []),
        ].filter(Boolean).join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }, [activities, category, date, favoriteIds, mode, query, venue]);

  const byDate = useMemo(() => {
    const groups: { date: string; items: Activity[] }[] = [];
    for (const activity of filtered) {
      const last = groups[groups.length - 1];
      if (last?.date === activity.date) {
        last.items.push(activity);
      } else {
        groups.push({ date: activity.date, items: [activity] });
      }
    }
    return groups;
  }, [filtered]);

  if (mode !== "all" && savedCount === 0) {
    return (
      <section className="empty-saved-card rounded-2xl p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-sky-900/10">
          <Heart className="h-12 w-12 fill-rose-500/10 text-rose-500" />
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-[-0.03em] text-slate-950">No favorites yet</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm font-semibold leading-6 text-stone-600">
          Browse the Program and tap ♥ to save activities here
        </p>
        <Link href="/program" className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2f62b6] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15">
          Browse Program
        </Link>
      </section>
    );
  }

  const dayHeaderTop = `calc(4.35rem + ${filterHeight}px)`;

  return (
    <section className="space-y-4">
      <div ref={filterRef} className="sticky top-[4.35rem] z-30 -mx-1 rounded-2xl bg-white/55 p-1 backdrop-blur-xl sm:top-19">
        <div className="filter-glass-card rounded-2xl p-4">
          <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-3 text-stone-700 shadow-sm ring-1 ring-sky-900/10">
            <Search className="h-5 w-5 shrink-0 text-[#2f62b6]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, teacher, place..."
              className="w-full bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
          <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Filter by day">
            <button type="button" onClick={() => setDate("all")} className={cn("day-filter-button", date === "all" && "day-filter-button-active")}>All days</button>
            {dates.map((item) => (
              <button key={item} type="button" onClick={() => setDate(item)} className={cn("day-filter-button", date === item && "day-filter-button-active")}>
                {formatDate(item)}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select value={venue} onChange={(event) => setVenue(event.target.value)} className="filter-select">
              <option value="all">Venue</option>
              {venues.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="filter-select">
              <option value="all">Category</option>
              {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card rounded-2xl p-8 text-center">
          <p className="text-lg font-bold text-stone-900">Nothing here yet</p>
          <p className="mt-2 text-sm text-stone-600">Add activities with the heart button, or clear the filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {byDate.map(({ date: d, items }) => (
            <section key={d}>
              <div
                className="sticky z-20 -mx-1 bg-white/90 px-1 py-2 backdrop-blur-sm"
                style={{ top: dayHeaderTop }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-[#2f62b6]">{formatDayLabel(d)}</span>
                  <div className="h-px flex-1 bg-sky-900/10" />
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {items.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} isFavorite={favoriteIds.has(activity.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
