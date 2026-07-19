"use client";

/**
 * Shown when a synced event is active: names it and offers the way back to
 * the built-in Summer Solstice 2026 content.
 */

import { CalendarRange, Undo2 } from "lucide-react";
import { setActiveEvent, useActiveSyncedEvent } from "@/lib/event-store";

export function ActiveEventBanner() {
  const synced = useActiveSyncedEvent();

  if (!synced) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#f39200]/30 bg-[#fff6e1]/90 px-4 py-3">
      <CalendarRange className="h-5 w-5 shrink-0 text-[#f39200]" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#9a5a00]">Viewing event</p>
        <p className="truncate text-sm font-black text-slate-900">{synced.name}</p>
      </div>
      <button
        type="button"
        onClick={() => setActiveEvent(null)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-black text-[#2f62b6] shadow-sm ring-1 ring-sky-200/80"
      >
        <Undo2 className="h-3.5 w-3.5" />
        Summer Solstice
      </button>
    </div>
  );
}
