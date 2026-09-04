"use client";

/**
 * Home events list: every event the backend publishes, the built-in one and
 * anything already downloaded — happening now first, then upcoming, then past.
 * The first entry is the Home's hero (deep-blue card, the event's cover as a
 * backdrop, display-size name, countdown, big calls to action — the same
 * language as the event's own hero); the rest are compact rows. Opening an event downloads its bundle when needed, records
 * the choice as deliberate (so background adoption never overrides it) and
 * lands on the event's own home at /event.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, Check, ChevronRight, CloudDownload, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { AppLink as Link } from "@/components/app-link";
import { activateEvent } from "@/lib/event-discovery";
import { removeSyncedEvent, useActiveSyncedEvent, useSyncedEvents } from "@/lib/event-store";
import { eventCountdown, formatEventDates, mergeHomeEvents, useHomeEvents, type EventPhase, type HomeEventEntry } from "@/lib/home-feed";
import { BUILTIN_EVENT_SLUG } from "@/lib/messages";

const EVENT_HOME = "/event";

const PHASE_LABEL: Record<EventPhase, { text: string; className: string; heroText: string }> = {
  live: { text: "Happening now", className: "bg-emerald-50 text-emerald-700 ring-emerald-200/80", heroText: "text-emerald-200" },
  upcoming: { text: "Upcoming", className: "bg-sky-50 text-[#2f62b6] ring-sky-200/80", heroText: "text-[#f39200]" },
  past: { text: "Past event", className: "bg-stone-100 text-stone-600 ring-stone-200", heroText: "text-white/75" },
  unscheduled: { text: "Dates soon", className: "bg-stone-100 text-stone-600 ring-stone-200", heroText: "text-white/75" },
};

type CardState = {
  entry: HomeEventEntry;
  active: boolean;
  busy: boolean;
  failed: boolean;
  onOpen: () => void;
  onRemove: () => void;
};

function PhaseChip({ phase, small = false }: { phase: EventPhase; small?: boolean }) {
  const label = PHASE_LABEL[phase];
  return (
    <span
      className={`inline-flex rounded-full font-black uppercase tracking-wide ring-1 ${label.className} ${
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      }`}
    >
      {label.text}
    </span>
  );
}

function ViewingMark({ onDark = false }: { onDark?: boolean }) {
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
        onDark ? "bg-white text-[#1d3f94] shadow-[0_6px_14px_rgba(0,0,0,0.18)]" : "bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] text-white"
      }`}
      aria-label="Viewing now"
    >
      <Check className="h-4 w-4" strokeWidth={3} />
    </span>
  );
}

function RemoveButton({ name, onRemove, onDark = false }: { name: string; onRemove: () => void; onDark?: boolean }) {
  return (
    <button
      type="button"
      aria-label={`Remove ${name} from this device`}
      onClick={onRemove}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
        onDark ? "text-white/70 hover:bg-white/15 hover:text-white" : "text-stone-400 hover:bg-rose-50 hover:text-rose-500"
      }`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function OpenLabel({ entry, active, busy }: { entry: HomeEventEntry; active: boolean; busy: boolean }) {
  if (busy) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Downloading…
      </>
    );
  }
  if (active || entry.downloaded) {
    return (
      <>
        {active ? "Continue" : "Open event"}
        <ChevronRight className="h-4 w-4" aria-hidden />
      </>
    );
  }
  return (
    <>
      <CloudDownload className="h-4 w-4" aria-hidden />
      Download & open
    </>
  );
}

function FeaturedEventCard({ entry, active, busy, failed, onOpen, onRemove }: CardState) {
  const phase = PHASE_LABEL[entry.phase];
  const dates = formatEventDates(entry.startDate, entry.endDate);
  const countdown = eventCountdown(entry);
  const showRegister = Boolean(entry.registrationUrl) && entry.phase !== "past";

  return (
    <article className="relative -mx-1 overflow-hidden rounded-2xl bg-[#1d3f94] text-white shadow-[0_24px_64px_rgba(18,51,130,0.30)] sm:mx-0">
      {entry.cover && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entry.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1d3f94]/20 via-[#1d3f94]/85 to-[#1d3f94]" />
        </>
      )}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-300/15 blur-3xl" />
      <div className="absolute -bottom-20 left-0 h-60 w-60 rounded-full bg-[#f39200]/12 blur-3xl" />
      <div className="premium-pass-hero pointer-events-none absolute inset-0" />

      <div className={`relative px-6 pb-6 sm:px-8 ${entry.cover ? "pt-32 sm:pt-40" : "pt-7"}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
            <span className={`text-[11px] font-black uppercase tracking-[0.18em] ${phase.heroText}`}>{phase.text}</span>
            {countdown && (
              <>
                <span className="h-3 w-px bg-white/25" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">{countdown}</span>
              </>
            )}
          </div>
          {active ? <ViewingMark onDark /> : entry.downloaded && !entry.builtin ? <RemoveButton name={entry.name} onRemove={onRemove} onDark /> : null}
        </div>

        <h2 className="solstice-title mt-5 text-4xl font-black uppercase leading-[0.92] text-white [text-wrap:balance] sm:text-6xl">{entry.name}</h2>
        {dates && <p className="mt-3 text-xl font-black text-[#f39200]">{dates}</p>}
        {entry.location && <p className="mt-1 text-sm font-semibold text-white/75">{entry.location}</p>}
        {entry.summary && <p className="mt-3 text-sm font-semibold leading-6 text-white/80">{entry.summary}</p>}

        <div className={`mt-6 grid gap-3 ${showRegister ? "grid-cols-2" : "grid-cols-1"}`}>
          <button
            type="button"
            onClick={onOpen}
            disabled={busy}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-black text-[#1d3f94] shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition active:scale-[0.98] disabled:opacity-70"
          >
            <OpenLabel entry={entry} active={active} busy={busy} />
          </button>
          {showRegister && (
            <Link
              href={entry.registrationUrl!}
              target="_blank"
              rel="noreferrer"
              aria-label={`Register for ${entry.name}`}
              className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border border-white/25 bg-white/12 px-4 py-3.5 text-sm font-black text-white"
            >
              Register
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          )}
        </div>
        {failed && <p className="mt-3 text-xs font-bold text-amber-200">Needs a connection to download. Try again later.</p>}
        {!failed && !entry.downloaded && !busy && (
          <p className="mt-3 text-xs font-semibold text-white/60">Downloads once, then works offline.</p>
        )}
      </div>
    </article>
  );
}

function EventRow({ entry, active, busy, failed, onOpen, onRemove }: CardState) {
  const dates = formatEventDates(entry.startDate, entry.endDate);
  const meta = [dates, entry.location].filter(Boolean).join(" · ");

  return (
    <article
      className={`flex items-center gap-2 rounded-2xl border bg-white pr-2 shadow-sm ${
        active ? "border-[#2f62b6]/50 ring-2 ring-[#2f62b6]/20" : "border-sky-900/10"
      }`}
    >
      <button type="button" onClick={onOpen} disabled={busy} className="flex min-w-0 flex-1 items-center gap-3 p-3.5 text-left disabled:opacity-70">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#1d3f94]">
          {entry.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={entry.cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="relative h-full w-full">
              <div className="absolute -right-3 -top-3 h-9 w-9 rounded-full bg-[#f39200]/80" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <PhaseChip phase={entry.phase} small />
            {active && <span className="text-[10px] font-black uppercase tracking-wide text-[#2f62b6]">Viewing</span>}
          </div>
          <h3 className="mt-1 line-clamp-1 text-[15px] font-black text-slate-950">{entry.name}</h3>
          {meta && <p className="line-clamp-1 text-xs font-semibold text-stone-500">{meta}</p>}
          {failed && <p className="mt-0.5 text-xs font-bold text-rose-600">Needs a connection to download.</p>}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-[#2f62b6]">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : entry.downloaded ? <ChevronRight className="h-4 w-4" aria-hidden /> : <CloudDownload className="h-4 w-4" aria-hidden />}
        </span>
      </button>
      {!active && entry.downloaded && !entry.builtin && <RemoveButton name={entry.name} onRemove={onRemove} />}
    </article>
  );
}

export function HomeEvents() {
  const router = useRouter();
  const catalog = useHomeEvents();
  const synced = useSyncedEvents();
  const active = useActiveSyncedEvent();
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const activeSlug = active ? active.slug : BUILTIN_EVENT_SLUG;
  const entries = useMemo(() => mergeHomeEvents(catalog, synced, activeSlug), [catalog, synced, activeSlug]);

  async function open(entry: HomeEventEntry) {
    setFailed(null);
    if (entry.slug === activeSlug) {
      router.push(EVENT_HOME);
      return;
    }
    setBusy(entry.slug);
    try {
      const ok = await activateEvent(entry.builtin ? null : entry.slug);
      if (!ok) {
        setFailed(entry.slug);
        return;
      }
      router.push(EVENT_HOME);
    } catch {
      setFailed(entry.slug);
    } finally {
      setBusy(null);
    }
  }

  const stateFor = (entry: HomeEventEntry): CardState => ({
    entry,
    active: entry.slug === activeSlug,
    busy: busy === entry.slug,
    failed: failed === entry.slug,
    onOpen: () => open(entry),
    onRemove: () => removeSyncedEvent(entry.slug),
  });

  const [featured, ...rest] = entries;

  return (
    <section aria-labelledby="home-events-title" className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <CalendarRange className="h-4 w-4 text-[#f39200]" aria-hidden />
        <h2 id="home-events-title" className="text-xs font-black uppercase tracking-[0.18em] text-[#f39200]">
          Events
        </h2>
        {entries.length > 1 && <span className="text-xs font-bold text-stone-400">· {entries.length}</span>}
      </div>

      {featured && <FeaturedEventCard {...stateFor(featured)} />}

      {rest.length > 0 && (
        <div className="space-y-2.5">
          {rest.map((entry) => (
            <EventRow key={entry.slug} {...stateFor(entry)} />
          ))}
        </div>
      )}
    </section>
  );
}
