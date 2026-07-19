"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Heart, Search, SlidersHorizontal } from "lucide-react";
import { AppLink as Link } from "@/components/app-link";
import { ActivityCard } from "@/components/activity-card";
import { useSavedActivities } from "@/lib/db";
import type { Activity, Category, Venue } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const formatDayLabel = (date: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00`));

type Mode = "all" | "favorites";

// Advanced filters — hour range covers the real program span (Sadhana starts 3:00 AM).
const RANGE_MIN = 180; // 3:00 AM, in minutes
const RANGE_MAX = 1350; // 10:30 PM
const RANGE_STEP = 15;
const MIN_GAP = 60; // keep at least 1h between the two thumbs

const TIME_OF_DAY = [
  { id: "morning", label: "Morning", from: 0, to: 719 },
  { id: "midday", label: "Midday", from: 720, to: 899 },
  { id: "afternoon", label: "Afternoon", from: 900, to: 1079 },
  { id: "evening", label: "Evening", from: 1080, to: 1439 },
] as const;

const toMinutesOfDay = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};

const formatMinutes = (minutes: number) => {
  const d = new Date(2026, 5, 19, Math.floor(minutes / 60), minutes % 60);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(d);
};

function FilterChip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onToggle} className={cn("cat-chip", selected && "cat-chip-selected")}>
      <Check className="cat-chip-tick" strokeWidth={3} />
      {label}
    </button>
  );
}

type ProgramExplorerProps = {
  activities: Activity[];
  venues: Venue[];
  categories: Category[];
  mode?: Mode;
  onOpenDetail?: (activity: Activity) => void;
  resolveTeacher?: (activity: Activity) => import("@/components/activity-card").TeacherResolution;
  teacherProfileLinks?: boolean;
};

export function ProgramExplorer({ activities, venues, categories, mode = "all", onOpenDetail, resolveTeacher, teacherProfileLinks }: ProgramExplorerProps) {
  const { favoriteIds, toggleFavorite } = useSavedActivities();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("all");
  const [venue, setVenue] = useState("all");
  const [category, setCategory] = useState("all");
  const [advOpen, setAdvOpen] = useState(false);
  const [advCategories, setAdvCategories] = useState<Set<string>>(new Set());
  const [timesOfDay, setTimesOfDay] = useState<Set<string>>(new Set());
  const [hourFrom, setHourFrom] = useState(RANGE_MIN);
  const [hourTo, setHourTo] = useState(RANGE_MAX);
  const filterRef = useRef<HTMLDivElement>(null);
  const dayStripRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  // On the main program view, default to the current day if it falls within the
  // event so attendees land on today's schedule without scrolling. Runs once on
  // mount (client only) to avoid static-export hydration mismatches.
  const appliedDefaultDay = useRef(false);
  useEffect(() => {
    if (appliedDefaultDay.current || mode !== "all") return;
    if (dates.includes(todayStr)) setDate(todayStr);
    appliedDefaultDay.current = true;
  }, [dates, mode, todayStr]);

  const rangeActive = hourFrom !== RANGE_MIN || hourTo !== RANGE_MAX;
  const advCount = advCategories.size + timesOfDay.size + (rangeActive ? 1 : 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activities
      .filter((item) => (mode === "favorites" ? favoriteIds.has(item.id) : true))
      .filter((item) => (date === "all" ? true : item.date === date))
      .filter((item) => (venue === "all" ? true : item.location === venue))
      .filter((item) =>
        advCategories.size > 0
          ? item.category !== undefined && advCategories.has(item.category)
          : category === "all" || item.category === category,
      )
      .filter((item) => {
        if (timesOfDay.size === 0) return true;
        const start = toMinutesOfDay(item.startTime);
        return TIME_OF_DAY.some((slot) => timesOfDay.has(slot.id) && start >= slot.from && start <= slot.to);
      })
      .filter((item) => {
        if (!rangeActive) return true;
        const start = toMinutesOfDay(item.startTime);
        return start >= hourFrom && start <= hourTo;
      })
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
  }, [activities, advCategories, category, date, favoriteIds, hourFrom, hourTo, mode, query, rangeActive, timesOfDay, venue]);

  const toggleAdvCategory = (name: string) => {
    setAdvCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    // The quick single-category select and the multi-select chips drive the same
    // dimension — selecting chips resets the select so they never conflict.
    setCategory("all");
  };

  const toggleTimeOfDay = (id: string) => {
    setTimesOfDay((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearAdvanced = () => {
    setAdvCategories(new Set());
    setTimesOfDay(new Set());
    setHourFrom(RANGE_MIN);
    setHourTo(RANGE_MAX);
  };

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

  // After today's filter is applied, bring the active day chip into view (so it
  // reads first) and jump the list to the activity nearest the current time.
  const didAutoScroll = useRef(false);
  useEffect(() => {
    if (didAutoScroll.current || mode !== "all") return;
    if (date !== todayStr || !dates.includes(todayStr)) return;
    didAutoScroll.current = true;

    const frame = requestAnimationFrame(() => {
      const strip = dayStripRef.current;
      const chip = strip?.querySelector<HTMLElement>(`[data-day="${todayStr}"]`);
      if (strip && chip) {
        const stripRect = strip.getBoundingClientRect();
        const chipRect = chip.getBoundingClientRect();
        strip.scrollBy({ left: chipRect.left - stripRect.left - 8, behavior: "smooth" });
      }

      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const toMinutes = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + (m || 0);
      };
      const todays = filtered.filter((item) => item.date === todayStr);
      if (todays.length === 0) return;
      const upcoming = todays.find((item) => toMinutes(item.startTime) >= nowMinutes);
      const target = upcoming ?? todays[todays.length - 1];
      const card = listRef.current?.querySelector<HTMLElement>(`[data-activity-id="${CSS.escape(target.id)}"]`);
      card?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    return () => cancelAnimationFrame(frame);
  }, [date, dates, filtered, mode, todayStr]);

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
          <div ref={dayStripRef} className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Filter by day">
            <button type="button" onClick={() => setDate("all")} className={cn("day-filter-button", date === "all" && "day-filter-button-active")}>All days</button>
            {dates.map((item) => (
              <button key={item} type="button" data-day={item} onClick={() => setDate(item)} className={cn("day-filter-button", date === item && "day-filter-button-active")}>
                {formatDate(item)}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select value={venue} onChange={(event) => setVenue(event.target.value)} className="filter-select">
              <option value="all">Venue</option>
              {venues.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setAdvCategories(new Set());
              }}
              className="filter-select"
            >
              <option value="all">Category</option>
              {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
          </div>

          <button
            type="button"
            className="adv-toggle"
            aria-expanded={advOpen}
            aria-controls="advanced-filters-panel"
            onClick={() => setAdvOpen((prev) => !prev)}
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-[1.1rem] w-[1.1rem]" />
              Advanced filters
            </span>
            {advCount > 0 && <span className="adv-count">{advCount}</span>}
            <ChevronDown className={cn("adv-chev h-[1.05rem] w-[1.05rem]", advCount === 0 && "ml-auto")} strokeWidth={2.4} />
          </button>

          <div id="advanced-filters-panel" className={cn("adv-panel", advOpen && "adv-panel-open")} aria-hidden={!advOpen}>
            <div className="adv-inner">
              <div className="adv-group">
                <span className="adv-group-label">Categories · pick several</span>
                <div className="chip-select">
                  {categories.map((item) => (
                    <FilterChip
                      key={item.id}
                      label={item.name}
                      selected={advCategories.has(item.name)}
                      onToggle={() => toggleAdvCategory(item.name)}
                    />
                  ))}
                </div>
              </div>

              <div className="adv-group">
                <span className="adv-group-label">Time of day</span>
                <div className="chip-select">
                  {TIME_OF_DAY.map((slot) => (
                    <FilterChip
                      key={slot.id}
                      label={slot.label}
                      selected={timesOfDay.has(slot.id)}
                      onToggle={() => toggleTimeOfDay(slot.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="adv-group">
                <span className="adv-group-label">Custom hour range</span>
                <div className="hour-range-labels">
                  <span>{formatMinutes(hourFrom)}</span>
                  <span>{formatMinutes(hourTo)}</span>
                </div>
                <div className="hour-range">
                  <div className="hour-range-track">
                    <div
                      className="hour-range-fill"
                      style={{
                        left: `${((hourFrom - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100}%`,
                        width: `${((hourTo - hourFrom) / (RANGE_MAX - RANGE_MIN)) * 100}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={RANGE_MIN}
                    max={RANGE_MAX}
                    step={RANGE_STEP}
                    value={hourFrom}
                    aria-label="From hour"
                    onChange={(event) => setHourFrom(Math.min(Number(event.target.value), hourTo - MIN_GAP))}
                  />
                  <input
                    type="range"
                    min={RANGE_MIN}
                    max={RANGE_MAX}
                    step={RANGE_STEP}
                    value={hourTo}
                    aria-label="To hour"
                    onChange={(event) => setHourTo(Math.max(Number(event.target.value), hourFrom + MIN_GAP))}
                  />
                </div>
              </div>

              <div className="adv-footer">
                <button type="button" className="adv-clear" onClick={clearAdvanced}>Clear</button>
                <button type="button" className="adv-apply" onClick={() => setAdvOpen(false)}>
                  Apply{advCount > 0 ? ` · ${advCount}` : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card rounded-2xl p-8 text-center">
          <p className="text-lg font-bold text-stone-900">Nothing here yet</p>
          <p className="mt-2 text-sm text-stone-600">Add activities with the heart button, or clear the filters.</p>
        </div>
      ) : (
        <div ref={listRef} className="space-y-2">
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
                  <div key={activity.id} data-activity-id={activity.id}>
                    <ActivityCard
                      activity={activity}
                      isFavorite={favoriteIds.has(activity.id)}
                      onToggleFavorite={toggleFavorite}
                      onOpenDetail={onOpenDetail}
                      resolveTeacher={resolveTeacher}
                      teacherProfileLinks={teacherProfileLinks}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
