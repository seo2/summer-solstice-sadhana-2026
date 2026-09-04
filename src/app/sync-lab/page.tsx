"use client";

/**
 * Sync Lab — internal test bench for the WordPress backend sync bundle.
 * Not linked from the app UI. Lets us point at a local or production
 * WordPress running the 3ho-solstice-app plugin, fetch the versioned
 * bundle, and render its content with the app's design system.
 */

import { useEffect, useState } from "react";
import { AppLink as Link } from "@/components/app-link";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { ArrowLeft, CalendarCheck, MapPin, RefreshCw, Undo2 } from "lucide-react";
import { saveBundle, setActiveEvent, useActiveSyncedEvent, type SyncedBundle } from "@/lib/event-store";
import type { Teacher } from "@/lib/types";
import { timeRange } from "@/lib/utils";

const BASE_KEY = "ssa-sync-lab-base";
const EVENT_KEY = "ssa-sync-lab-event";

type BundleProgramItem = {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  title: string;
  category?: string;
  tags?: string[];
  location?: string;
  facilitator?: string;
  country?: string;
  language?: string;
  description?: string;
  photo?: string;
};

type Bundle = {
  ok: boolean;
  unchanged?: boolean;
  version: number;
  event?: { slug: string; name: string; startDate?: string; endDate?: string; location?: string; timezone?: string; status?: string };
  program?: BundleProgramItem[];
  teachers?: (Teacher & { bio?: string })[];
  venues?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  infoPages?: { id: string; title: string }[];
};

const ROUTINE_CATEGORIES = new Set(["Meal", "Logistics"]);

function formatDayLong(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export default function SyncLabPage() {
  const [base, setBase] = useState("");
  const [eventSlug, setEventSlug] = useState("winter-solstice-2025");
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [unchangedNote, setUnchangedNote] = useState("");
  const activeSynced = useActiveSyncedEvent();

  async function useInApp() {
    if (!bundle?.event) return;
    await setActiveEvent(bundle.event.slug);
  }

  useEffect(() => {
    setBase(localStorage.getItem(BASE_KEY) ?? "");
    setEventSlug(localStorage.getItem(EVENT_KEY) ?? "winter-solstice-2025");
  }, []);

  async function fetchBundle(since?: number) {
    const cleanBase = base.trim().replace(/\/$/, "");
    if (!cleanBase) {
      setStatus("Enter the backend base URL first (e.g. http://3ho.local or https://www.3ho.org).");
      return;
    }

    localStorage.setItem(BASE_KEY, cleanBase);
    localStorage.setItem(EVENT_KEY, eventSlug.trim());
    setBusy(true);
    setStatus(since === undefined ? "Fetching bundle…" : `Fetching with since=${since}…`);
    setUnchangedNote("");

    const url = `${cleanBase}/wp-json/3ho-solstice/v1/sync?event=${encodeURIComponent(eventSlug.trim())}${since !== undefined ? `&since=${since}` : ""}`;

    try {
      const started = performance.now();
      const response = await fetch(url);
      const ms = Math.round(performance.now() - started);
      const etag = response.headers.get("ETag") ?? "(not exposed — CORS)";

      if (!response.ok) {
        const body = await response.text();
        setStatus(`HTTP ${response.status} in ${ms}ms — ${body.slice(0, 300)}`);
        setBusy(false);
        return;
      }

      const data = (await response.json()) as Bundle;

      if (data.unchanged) {
        setUnchangedNote(`Server says unchanged at version ${data.version} (${ms}ms, ETag ${etag}) — incremental sync works.`);
      } else {
        setBundle(data);
        // Every fetched bundle is stored locally right away, so it shows up
        // in Home → "Events" without needing to activate it first.
        if (data.event) {
          await saveBundle(cleanBase, data as unknown as SyncedBundle);
        }
        setStatus(`OK in ${ms}ms · version ${data.version} · ETag ${etag} · program ${data.program?.length ?? 0} · teachers ${data.teachers?.length ?? 0} · venues ${data.venues?.length ?? 0} · categories ${data.categories?.length ?? 0} · saved locally`);
      }
    } catch (error) {
      setStatus(`Fetch failed: ${error instanceof Error ? error.message : String(error)}. Check that WordPress is reachable and the plugin is active (CORS allows localhost dev servers).`);
    }

    setBusy(false);
  }

  const groups: { date: string; items: BundleProgramItem[] }[] = [];
  for (const item of bundle?.program ?? []) {
    const last = groups[groups.length - 1];
    if (last && last.date === item.date) last.items.push(item);
    else groups.push({ date: item.date, items: [item] });
  }

  return (
    <div className="space-y-5 pt-1">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-black text-[#2f62b6]"><ArrowLeft className="h-4 w-4" /> Home</Link>

      <section>
        <p className="solstice-kicker text-xs font-black uppercase text-[#f39200]">Internal · Backend Test</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-[#2f62b6]">Sync Lab</h1>
        <p className="mt-1 text-sm font-semibold text-stone-600">Fetches the versioned content bundle from a WordPress backend running the 3ho-solstice-app plugin.</p>
      </section>

      <section className="filter-glass-card space-y-3 rounded-2xl p-4">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-widest text-stone-400">Backend base URL</span>
          <input
            value={base}
            onChange={(event) => setBase(event.target.value)}
            placeholder="http://3ho.local"
            className="mt-1 w-full rounded-xl bg-white px-3 py-3 text-base font-semibold text-slate-900 shadow-sm ring-1 ring-sky-900/10 outline-none placeholder:text-slate-400"
          />
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase tracking-widest text-stone-400">Event slug</span>
          <input
            value={eventSlug}
            onChange={(event) => setEventSlug(event.target.value)}
            className="mt-1 w-full rounded-xl bg-white px-3 py-3 text-base font-semibold text-slate-900 shadow-sm ring-1 ring-sky-900/10 outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fetchBundle()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] px-5 py-3 text-sm font-black text-white shadow-[0_12px_26px_rgba(47,98,182,0.24)] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            Fetch bundle
          </button>
          {bundle && (
            <button
              type="button"
              disabled={busy}
              onClick={() => fetchBundle(bundle.version)}
              className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#2f62b6] shadow-sm ring-1 ring-sky-200/80 disabled:opacity-50"
            >
              Re-fetch with since={bundle.version}
            </button>
          )}
        </div>
        {status && <p className="text-xs font-semibold leading-5 text-stone-600">{status}</p>}
        {unchangedNote && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200/80">{unchangedNote}</p>}
      </section>

      {bundle?.event && (
        <section className="activity-detail-card rounded-2xl p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#2f62b6]">{bundle.event.slug} · v{bundle.version} · {bundle.event.status}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{bundle.event.name}</h2>
          <p className="mt-1 text-sm font-semibold text-stone-600">
            {[bundle.event.startDate, bundle.event.endDate].filter(Boolean).join(" – ")}
            {bundle.event.location ? ` · ${bundle.event.location}` : ""}
            {bundle.event.timezone ? ` · ${bundle.event.timezone}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {activeSynced?.slug === bundle.event.slug ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-200/80">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Active in the app
                </span>
                <Link href="/program" className="rounded-full bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] px-4 py-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(47,98,182,0.24)]">
                  Open Program
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveEvent(null)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-black text-[#2f62b6] shadow-sm ring-1 ring-sky-200/80"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Back to Summer Solstice
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={useInApp}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#2f62b6] to-[#39a9ef] px-4 py-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(47,98,182,0.24)]"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                Use this event in the app
              </button>
            )}
          </div>
        </section>
      )}

      {bundle?.teachers && bundle.teachers.length > 0 && (
        <section>
          <div className="flex items-center gap-3 pb-1">
            <span className="text-sm font-black text-[#2f62b6]">Teachers · {bundle.teachers.length}</span>
            <div className="h-px flex-1 bg-sky-900/10" />
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            {bundle.teachers.map((teacher) => (
              <div key={teacher.id} className="activity-list-card flex flex-col items-center gap-2.5 rounded-2xl p-4 text-center">
                <TeacherAvatar teacher={{ ...teacher, facilitatorNames: teacher.facilitatorNames ?? [teacher.name], bio: teacher.bio ?? "" }} size="lg" />
                <span className="block">
                  <span className="block text-[15px] font-black leading-tight text-slate-900">{teacher.name}</span>
                  {teacher.country && <span className="mt-0.5 block text-xs font-bold text-stone-500">{teacher.country}</span>}
                </span>
                {teacher.bio ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 ring-1 ring-emerald-200/80">Bio ✓</span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-extrabold text-stone-500 ring-1 ring-stone-200">No bio</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {groups.map((group) => (
        <section key={group.date}>
          <div className="flex items-center gap-3 pb-1 pt-2">
            <span className="text-sm font-black text-[#2f62b6]">{formatDayLong(group.date)}</span>
            <div className="h-px flex-1 bg-sky-900/10" />
          </div>
          <div className="space-y-3">
            {group.items.map((item) =>
              item.category && ROUTINE_CATEGORIES.has(item.category) ? (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-stone-300" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-stone-400">{timeRange(item.startTime, item.endTime)}</p>
                    <p className="text-sm font-bold leading-snug text-stone-500">{item.title}</p>
                  </div>
                </div>
              ) : (
                <article key={item.id} className="activity-list-card rounded-2xl p-4">
                  <p className="text-sm font-bold leading-tight text-[#f39200]">{timeRange(item.startTime, item.endTime)}</p>
                  <h3 className="mt-2 text-[18px] font-black leading-snug text-slate-900">{item.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                    {item.category && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800 ring-1 ring-amber-200/80">{item.category}</span>}
                    {item.tags?.map((tag) => (
                      <span key={tag} className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-800 ring-1 ring-rose-200/80">{tag}</span>
                    ))}
                    {item.location && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-[#2f62b6] ring-1 ring-sky-200/80"><MapPin className="mr-1 inline h-3.5 w-3.5" />{item.location}</span>}
                    {item.language && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-800 ring-1 ring-sky-200/80">{item.language}</span>}
                  </div>
                  {(item.facilitator || item.description) && (
                    <div className="mt-3 flex items-start gap-3">
                      {item.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.photo} alt={item.facilitator ?? item.title} className="w-14 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-sky-900/10" />
                      )}
                      <div className="min-w-0">
                        {item.facilitator && <p className="text-sm font-semibold text-slate-700">With <span className="font-bold text-[#2f62b6]">{item.facilitator}</span>{item.country ? ` · ${item.country}` : ""}</p>}
                        {item.description && <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>}
                      </div>
                    </div>
                  )}
                </article>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
