"use client";

/**
 * Info Hub gate for synced events: while a synced event is active, its own
 * info pages (from the bundle, offline once synced) replace the built-in
 * Summer Solstice booklet content — so a WSOL26 attendee never reads the
 * wrong campground's guide. With no synced event active, renders the
 * server-rendered built-in Info Hub passed as children.
 *
 * Synced pages are authored fresh in wp-admin (no PDF-extraction cleanup
 * needed): paragraphs separated by blank lines, bullet lines starting with
 * ∙ • — or -.
 */

import { Fragment, type ReactNode } from "react";
import { ChevronDown, Megaphone } from "lucide-react";
import { ActiveEventBanner } from "@/components/active-event-banner";
import { bundleInfoPages, useActiveSyncedEvent, type SyncedInfoPage } from "@/lib/event-store";

type InfoItem = { k: "p" | "b"; text: string };

function parseContent(content: string): InfoItem[] {
  const items: InfoItem[] = [];
  const paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length === 0) return;
    items.push({ k: "p", text: paragraph.join(" ").trim() });
    paragraph.length = 0;
  };

  for (const rawLine of content.split(/\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flush();
      continue;
    }
    if (/^[∙•—-]\s*/.test(line)) {
      flush();
      items.push({ k: "b", text: line.replace(/^[∙•—-]\s*/, "") });
      continue;
    }
    paragraph.push(line);
  }
  flush();

  return items;
}

function SyncedInfoCard({ page }: { page: SyncedInfoPage }) {
  const items = parseContent(page.content);

  // Group consecutive bullets so they render as one list.
  const groups: InfoItem[][] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last[0].k === item.k && item.k === "b") {
      last.push(item);
    } else {
      groups.push([item]);
    }
  }

  return (
    <details className="card group rounded-xl p-4">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <span className="block text-lg font-black leading-snug text-slate-950">{page.title}</span>
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 group-open:bg-[#2f62b6] group-open:text-white">
          Open <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div className="mt-4 space-y-3 border-t border-sky-900/10 pt-4">
        {groups.map((group, gi) =>
          group[0].k === "b" ? (
            <ul key={gi} className="space-y-2">
              {group.map((item) => (
                <li key={item.text.slice(0, 90)} className="flex gap-3 rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-emerald-900/5">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Fragment key={gi}>
              {group.map((item) => (
                <p key={item.text.slice(0, 90)} className="text-sm leading-7 text-slate-700">
                  {item.text}
                </p>
              ))}
            </Fragment>
          ),
        )}
      </div>
    </details>
  );
}

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
            Essential event information, saved on your device so it works even offline.
          </p>
        </div>
      </section>

      {pages.length === 0 ? (
        <div className="rounded-2xl border border-sky-900/10 bg-white p-6 text-center shadow-sm">
          <Megaphone className="mx-auto h-8 w-8 text-sky-200" aria-hidden />
          <p className="mt-3 text-sm font-bold text-stone-600">Event info not published yet</p>
          <p className="mt-1 text-xs font-semibold text-stone-400">
            Arrival details and camp-life guidance for {synced.name} will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <SyncedInfoCard key={page.id} page={page} />
          ))}
        </div>
      )}
    </div>
  );
}
