"use client";

/**
 * Info Hub gate for synced events: while a synced event is active, its own
 * info pages (from the bundle, offline once synced) replace the built-in
 * Summer Solstice booklet content — so a WSOL26 attendee never reads the
 * wrong campground's guide. With no synced event active, renders the
 * server-rendered built-in Info Hub passed as children.
 *
 * Synced pages go through the same `InfoHub` as the booklet: grouped by the
 * topic catalog (the page's `group` key, else its known id, else "More") and
 * parsed into section cards. Authoring conventions for wp-admin texts are
 * documented in `src/lib/info-content.ts` and docs/CONTENT-MODEL.md.
 */

import type { ReactNode } from "react";
import { Megaphone } from "lucide-react";
import { ActiveEventBanner } from "@/components/active-event-banner";
import { InfoHub, InstallHintLink } from "@/components/info-hub";
import { ScheduleNoticeCard } from "@/components/schedule-notice";
import { bundleInfoPages, useActiveSyncedEvent } from "@/lib/event-store";

export function SyncedInfoGate({ children }: { children: ReactNode }) {
  const synced = useActiveSyncedEvent();

  if (!synced) return <>{children}</>;

  const pages = bundleInfoPages(synced.bundle);

  return (
    <div className="space-y-5">
      <ActiveEventBanner />
      <section className="relative overflow-hidden rounded-xl bg-[#2f62b6] p-5 text-white shadow-xl">
        <div className="absolute -right-12 -top-14 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-[#f39200]/25 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-100">{synced.name}</p>
          <h1 className="mt-2 text-4xl font-black leading-none">Info Hub</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50/90">
            Essential event information grouped by topic, saved on your device so it works even offline.
          </p>
        </div>
      </section>

      <ScheduleNoticeCard />

      <InstallHintLink />

      {pages.length === 0 ? (
        <div className="rounded-2xl border border-sky-900/10 bg-white p-6 text-center shadow-sm">
          <Megaphone className="mx-auto h-8 w-8 text-sky-200" aria-hidden />
          <p className="mt-3 text-sm font-bold text-stone-600">Event info not published yet</p>
          <p className="mt-1 text-xs font-semibold text-stone-400">
            Arrival details and camp-life guidance for {synced.name} will appear here.
          </p>
        </div>
      ) : (
        <InfoHub pages={pages} />
      )}
    </div>
  );
}
