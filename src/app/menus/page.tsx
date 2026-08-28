"use client";

/**
 * Daily menus (WS8): the active synced event's food menus from the bundle —
 * grouped by day, opening on today, offline once synced. Mid-event changes
 * arrive through the UpdateAgent like any other content. The built-in event
 * has no menu data, so the page shows a friendly empty state.
 */

import { useMemo, useState } from "react";
import { Coffee, Cookie, Moon, UtensilsCrossed } from "lucide-react";
import { ActiveEventBanner } from "@/components/active-event-banner";
import { bundleMenus, useActiveSyncedEvent, type MenuDay } from "@/lib/event-store";

const MEAL_ORDER: MenuDay["meal"][] = ["breakfast", "lunch", "dinner", "snack"];

const MEAL_META: Record<MenuDay["meal"], { label: string; icon: typeof Coffee; accent: string }> = {
  breakfast: { label: "Breakfast", icon: Coffee, accent: "bg-orange-50 text-[#9a5a00] ring-orange-900/10" },
  lunch: { label: "Lunch", icon: UtensilsCrossed, accent: "bg-emerald-50 text-emerald-700 ring-emerald-900/10" },
  dinner: { label: "Dinner", icon: Moon, accent: "bg-indigo-50 text-indigo-700 ring-indigo-900/10" },
  snack: { label: "Snack", icon: Cookie, accent: "bg-sky-50 text-[#2f62b6] ring-sky-900/10" },
};

function localToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatDay(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function MenusPage() {
  const synced = useActiveSyncedEvent();
  const menus = useMemo(() => (synced ? bundleMenus(synced.bundle) : []), [synced]);
  const dates = useMemo(() => Array.from(new Set(menus.map((menu) => menu.date))).sort(), [menus]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = localToday();
  const activeDate = selectedDate && dates.includes(selectedDate) ? selectedDate : dates.includes(today) ? today : dates[0];

  const dayMenus = menus
    .filter((menu) => menu.date === activeDate)
    .sort((a, b) => MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal));

  return (
    <div className="space-y-4">
      <ActiveEventBanner />
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f39200]">Camp kitchen</p>
        <h1 className="text-4xl font-black tracking-[-0.05em] text-[#2f62b6]">Menus</h1>
        <p className="mt-1 text-sm font-semibold text-stone-500">
          What the kitchen is serving each day. Saved on your device — works without signal.
        </p>
      </div>

      {menus.length === 0 ? (
        <div className="rounded-2xl border border-sky-900/10 bg-white p-6 text-center shadow-sm">
          <UtensilsCrossed className="mx-auto h-8 w-8 text-sky-200" aria-hidden />
          <p className="mt-3 text-sm font-bold text-stone-600">Menus not published yet</p>
          <p className="mt-1 text-xs font-semibold text-stone-400">
            Daily menus will appear here once the event team publishes them.
          </p>
        </div>
      ) : (
        <>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {dates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                aria-pressed={date === activeDate}
                className={`inline-flex min-h-10 shrink-0 items-center rounded-full px-4 py-2 text-xs font-black shadow-sm ring-1 transition active:scale-95 ${
                  date === activeDate ? "bg-[#2f62b6] text-white ring-[#2f62b6]" : "bg-white text-slate-700 ring-sky-900/10"
                }`}
              >
                {date === today ? `Today · ${formatDay(date)}` : formatDay(date)}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {dayMenus.map((menu) => {
              const meta = MEAL_META[menu.meal];
              const Icon = meta.icon;
              return (
                <article key={menu.id} className="rounded-2xl border border-sky-900/10 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.accent}`}>
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{meta.label}</p>
                      {menu.title && <p className="text-sm font-black text-slate-950">{menu.title}</p>}
                    </div>
                  </div>
                  {menu.items.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {menu.items.map((dish) => (
                        <li key={dish} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f39200]" />
                          <span>{dish}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {menu.notes && (
                    <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-900/10">
                      {menu.notes}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
