"use client";

/**
 * Home section listing every locally synced event plus the built-in one, with
 * one-tap switching. Renders nothing until at least one synced event exists,
 * so the regular attendee home stays untouched.
 */

import { CalendarRange, Check, Trash2 } from "lucide-react";
import {
  removeSyncedEvent,
  setActiveEvent,
  useActiveSyncedEvent,
  useSyncedEvents,
} from "@/lib/event-store";

const BUILTIN_NAME = "Summer Solstice Sadhana 2026";
const BUILTIN_DATES = "June 19–27, 2026 · Ram Das Puri";

function formatDates(start?: string, end?: string) {
  if (!start) return "";
  const fmt = (date: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
  return end && end !== start ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

export function EventSwitcher() {
  const syncedEvents = useSyncedEvents();
  const active = useActiveSyncedEvent();

  if (syncedEvents.length === 0) return null;

  const builtinActive = !active;

  return (
    <section className="overflow-hidden rounded-2xl border border-sky-900/10 bg-white shadow-[0_18px_48px_rgba(47,98,182,0.11)]">
      <div className="flex items-center gap-2 px-4 pt-4">
        <CalendarRange className="h-4 w-4 text-[#f39200]" />
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f39200]">Your events</p>
      </div>

      <div className="divide-y divide-sky-900/5 px-2 py-2">
        <button
          type="button"
          onClick={() => setActiveEvent(null)}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-sky-50/60"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-black text-slate-900">{BUILTIN_NAME}</p>
            <p className="text-xs font-semibold text-stone-500">{BUILTIN_DATES}</p>
          </div>
          {builtinActive && (
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] text-white shadow-[0_6px_14px_rgba(47,98,182,0.3)]">
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
          )}
        </button>

        {syncedEvents.map((record) => {
          const isActive = active?.slug === record.slug;
          const dates = formatDates(record.bundle.event.startDate, record.bundle.event.endDate);
          const meta = [dates, record.bundle.event.location].filter(Boolean).join(" · ");

          return (
            <div key={record.slug} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveEvent(record.slug)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-sky-50/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-black text-slate-900">{record.name}</p>
                  <p className="truncate text-xs font-semibold text-stone-500">{meta}</p>
                </div>
                {isActive && (
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] text-white shadow-[0_6px_14px_rgba(47,98,182,0.3)]">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-label={`Remove ${record.name}`}
                onClick={() => removeSyncedEvent(record.slug)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
