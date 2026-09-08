"use client";

/**
 * The interactive card under a landing's hero: register (outside the app,
 * online only), "Save reminder" (local opt-in — the online reminder banner
 * then points back here), add the dates to the calendar, jump to the FAQ.
 * Storage keys are per landing (landingInterestKey), so several landings can
 * be saved at once. Renders only for landings that carry a call to action.
 */

import { LANDING_INTEREST_EVENT, landingInterestKey } from "@/lib/landings";
import { Bell, CalendarPlus, CheckCircle, CircleHelp, ExternalLink, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  landingId: string;
  ctaUrl: string;
  ctaLabel?: string;
  /** A calendar file URL or a data: URL built on the device (landing-calendar.ts). */
  calendarHref?: string;
  calendarFileName?: string;
  faqHref?: string;
};

function readSavedInterest(key: string) {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(key) === "true";
}

function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(window.navigator.onLine);
    const update = () => setOnline(window.navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}

export function LandingActions({ landingId, ctaUrl, ctaLabel = "Register today", calendarHref, calendarFileName, faqHref }: Props) {
  const online = useOnlineStatus();
  const [saved, setSaved] = useState(false);
  const interestKey = landingInterestKey(landingId);

  useEffect(() => {
    setSaved(readSavedInterest(interestKey));
  }, [interestKey]);

  function saveInterest() {
    window.localStorage.setItem(interestKey, "true");
    window.dispatchEvent(new Event(LANDING_INTEREST_EVENT));
    setSaved(true);
  }

  const secondaryRow = calendarHref || faqHref;

  return (
    <section className="rounded-xl border border-sky-900/10 bg-white p-4 shadow-[0_18px_48px_rgba(47,98,182,0.09)]">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-2 ${online ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-[#9a5a00]"}`}>
          {online ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
        </div>
        <div>
          <h2 className="text-lg font-black leading-tight text-slate-950">
            {online ? "Registration is available now" : "Save it for when you are online"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {online
              ? "The checkout opens outside this app. If camp connectivity is unreliable, save this reminder too."
              : "Your interest is stored only on this device. When internet returns, the app can show the registration link."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {online ? (
          <a
            href={ctaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2f62b6] px-4 py-3 text-center text-sm font-black text-white shadow-[0_12px_28px_rgba(47,98,182,0.24)]"
          >
            {ctaLabel}
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-black text-slate-400"
          >
            Registration needs internet
            <WifiOff className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={saveInterest}
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-black transition ${
            saved
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-[#f39200]/30 bg-orange-50 text-[#9a5a00]"
          }`}
        >
          {saved ? (
            <>
              Saved on this device
              <CheckCircle className="h-4 w-4" />
            </>
          ) : (
            <>
              Save reminder
              <Bell className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {secondaryRow && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {calendarHref && (
            <a
              href={calendarHref}
              download={calendarFileName ?? true}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-900/10 bg-sky-50 px-4 py-2.5 text-center text-sm font-black text-[#2f62b6]"
            >
              Add dates to calendar
              <CalendarPlus className="h-4 w-4" />
            </a>
          )}
          {faqHref && (
            <a
              href={faqHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-900/10 bg-white px-4 py-2.5 text-center text-sm font-black text-slate-700"
            >
              View FAQ
              <CircleHelp className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </section>
  );
}
