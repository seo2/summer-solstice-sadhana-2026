"use client";

/**
 * Online reminder for saved landings: once the attendee tapped "Save reminder"
 * on a landing and the device is back online, a small fixed banner offers the
 * registration link and a way back to the landing, until dismissed. Personal
 * opt-in, so it is not gated by the active event. Today it knows the built-in
 * landings; synced landings join once they reach the local store.
 */

import { AppLink as Link } from "@/components/app-link";
import {
  LANDING_INTEREST_EVENT,
  builtinLandings,
  landingDismissedKey,
  landingHref,
  landingInterestKey,
  type Landing,
} from "@/lib/landings";
import { CheckCircle, ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";

function pendingLanding(): Landing | null {
  if (typeof window === "undefined" || !window.navigator.onLine) return null;
  const storage = window.localStorage;
  return (
    builtinLandings.find(
      (landing) =>
        landing.cta &&
        landing.status !== "draft" &&
        storage.getItem(landingInterestKey(landing.id)) === "true" &&
        storage.getItem(landingDismissedKey(landing.id)) !== "true",
    ) ?? null
  );
}

export function LandingReminder() {
  const [landing, setLanding] = useState<Landing | null>(null);

  useEffect(() => {
    const update = () => setLanding(pendingLanding());
    update();
    window.addEventListener("online", update);
    window.addEventListener("storage", update);
    window.addEventListener(LANDING_INTEREST_EVENT, update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("storage", update);
      window.removeEventListener(LANDING_INTEREST_EVENT, update);
    };
  }, []);

  if (!landing || !landing.cta) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 mx-auto max-w-3xl rounded-2xl border border-[#2f62b6]/20 bg-white p-3 text-sm shadow-2xl">
      <div className="flex items-start gap-2">
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="font-black text-slate-950">{landing.title}</p>
          <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500">
            Registration is online. You saved this event: open registration now, or revisit the offline page.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={landing.cta.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#2f62b6] px-3 py-1.5 text-xs font-black text-white"
            >
              Register
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link href={landingHref(landing)} className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-[#2f62b6]">
              View details
            </Link>
          </div>
        </div>
        <button
          type="button"
          aria-label={`Dismiss ${landing.title} reminder`}
          onClick={() => {
            window.localStorage.setItem(landingDismissedKey(landing.id), "true");
            setLanding(pendingLanding());
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
