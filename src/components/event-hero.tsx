"use client";

/**
 * Event home hero gate: while a synced event is active, the hero shows THAT
 * event (name, dates, location, same CTAs) instead of the built-in Summer
 * Solstice artwork — the last SSOL-only surface a synced-event attendee would
 * see. With no synced event, renders the server-rendered built-in hero
 * (children). Lives on /event, the event's own home; the app's Home (/) lists
 * every event instead.
 */

import type { ReactNode } from "react";
import { AppLink as Link } from "@/components/app-link";
import { useActiveSyncedEvent } from "@/lib/event-store";

function formatRange(start?: string, end?: string): string | null {
  if (!start) return null;
  const from = new Date(`${start}T12:00:00`);
  if (Number.isNaN(from.getTime())) return null;
  const month = (date: Date) => date.toLocaleDateString("en-US", { month: "short" });
  const to = end ? new Date(`${end}T12:00:00`) : null;

  if (to && !Number.isNaN(to.getTime())) {
    if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
      return `${month(from)} ${from.getDate()}–${to.getDate()}, ${to.getFullYear()}`;
    }
    return `${month(from)} ${from.getDate()} – ${month(to)} ${to.getDate()}, ${to.getFullYear()}`;
  }

  return `${month(from)} ${from.getDate()}, ${from.getFullYear()}`;
}

export function EventHero({ children }: { children: ReactNode }) {
  const synced = useActiveSyncedEvent();

  if (!synced) return <>{children}</>;

  const { event } = synced.bundle;
  const dates = formatRange(event.startDate, event.endDate);

  return (
    <section className="relative -mx-1 overflow-hidden rounded-2xl bg-[#1d3f94] px-6 pb-7 pt-8 shadow-[0_24px_64px_rgba(18,51,130,0.30)] sm:mx-0 sm:px-8">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/15 blur-3xl" />
      <div className="absolute -bottom-20 left-0 h-60 w-60 rounded-full bg-[#f39200]/12 blur-3xl" />
      <div className="premium-pass-hero absolute inset-0 pointer-events-none" />

      <div className="relative space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f39200]">3HO</span>
          {dates && (
            <>
              <span className="h-3 w-px bg-white/25" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/60">{dates}</span>
            </>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-white [text-wrap:balance] sm:text-6xl">
            {synced.name}
          </h1>
          {event.location && (
            <p className="mt-4 text-lg font-semibold text-white/70">{event.location}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/program" className="rounded-2xl bg-white px-4 py-3.5 text-center text-sm font-black text-[#1d3f94] shadow-[0_8px_20px_rgba(0,0,0,0.15)]">Open Program</Link>
          <Link href="/info" className="rounded-2xl border border-white/25 bg-white/12 px-4 py-3.5 text-center text-sm font-black text-white">Info Hub</Link>
        </div>
      </div>
    </section>
  );
}
