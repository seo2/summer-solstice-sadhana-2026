"use client";

import { AppLink as Link } from "@/components/app-link";
import {
  WOMENS_RENEWAL_INTEREST_KEY,
  WOMENS_RENEWAL_PATH,
  WOMENS_RENEWAL_REGISTRATION_URL,
} from "@/lib/womens-renewal";
import { CheckCircle, ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "womens-renewal-2026-online-dismissed";

function shouldShowReminder() {
  if (typeof window === "undefined") return false;
  return (
    window.navigator.onLine &&
    window.localStorage.getItem(WOMENS_RENEWAL_INTEREST_KEY) === "true" &&
    window.localStorage.getItem(DISMISSED_KEY) !== "true"
  );
}

export function WomensRenewalReminder() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(shouldShowReminder());
    update();
    window.addEventListener("online", update);
    window.addEventListener("storage", update);
    window.addEventListener("womens-renewal-interest", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("storage", update);
      window.removeEventListener("womens-renewal-interest", update);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 mx-auto max-w-3xl rounded-2xl border border-[#2f62b6]/20 bg-white p-3 text-sm shadow-2xl">
      <div className="flex items-start gap-2">
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="font-black text-slate-950">Women&apos;s Renewal registration is online.</p>
          <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500">
            You saved this event. Open registration now, or revisit the offline page.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={WOMENS_RENEWAL_REGISTRATION_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#2f62b6] px-3 py-1.5 text-xs font-black text-white"
            >
              Register
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link href={WOMENS_RENEWAL_PATH} className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-[#2f62b6]">
              View details
            </Link>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss Women's Renewal reminder"
          onClick={() => {
            window.localStorage.setItem(DISMISSED_KEY, "true");
            setVisible(false);
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
