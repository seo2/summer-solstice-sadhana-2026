"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ActivityCard } from "@/components/activity-card";
import { useSavedActivities } from "@/lib/db";
import type { Activity, Category, Venue } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Mode = "all" | "favorites" | "agenda";

export function ProgramExplorer({ activities, venues, categories, mode = "all" }: { activities: Activity[]; venues: Venue[]; categories: Category[]; mode?: Mode }) {
  const { favoriteIds, agendaIds, toggleFavorite, toggleAgenda } = useSavedActivities();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("all");
  const [venue, setVenue] = useState("all");
  const [category, setCategory] = useState("all");

  const dates = useMemo(() => Array.from(new Set(activities.map((item) => item.date))).sort(), [activities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activities
      .filter((item) => (mode === "favorites" ? favoriteIds.has(item.id) : mode === "agenda" ? agendaIds.has(item.id) : true))
      .filter((item) => (date === "all" ? true : item.date === date))
      .filter((item) => (venue === "all" ? true : item.location === venue))
      .filter((item) => (category === "all" ? true : item.category === category))
      .filter((item) => {
        if (!q) return true;
        return [item.title, item.description, item.facilitator, item.location].filter(Boolean).join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }, [activities, agendaIds, category, date, favoriteIds, mode, query, venue]);

  return (
    <section className="space-y-4">
      <div className="card rounded-3xl p-4">
        <label className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 text-stone-700 shadow-sm">
          <Search className="h-5 w-5 text-orange-700" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, teacher, place..." className="w-full bg-transparent text-base outline-none" />
        </label>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select value={date} onChange={(event) => setDate(event.target.value)} className="rounded-2xl border border-orange-900/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800">
            <option value="all">All days</option>
            {dates.map((item) => <option key={item} value={item}>{formatDate(item)}</option>)}
          </select>
          <select value={venue} onChange={(event) => setVenue(event.target.value)} className="rounded-2xl border border-orange-900/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800">
            <option value="all">All venues</option>
            {venues.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-orange-900/10 bg-white px-3 py-3 text-sm font-semibold text-stone-800">
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </div>
      </div>

      <p className="px-1 text-sm font-semibold text-stone-600">{filtered.length} activities</p>

      {filtered.length === 0 ? (
        <div className="card rounded-3xl p-8 text-center">
          <p className="text-lg font-bold text-stone-900">Nothing here yet</p>
          <p className="mt-2 text-sm text-stone-600">Add activities with the heart or star buttons, or clear the filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} isFavorite={favoriteIds.has(activity.id)} isAgenda={agendaIds.has(activity.id)} onToggleFavorite={toggleFavorite} onToggleAgenda={toggleAgenda} />
          ))}
        </div>
      )}
    </section>
  );
}
