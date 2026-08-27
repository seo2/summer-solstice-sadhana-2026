"use client";

/**
 * Background agent: keeps locally synced events fresh over the internet.
 * Triggers a refresh shortly after app start, when the app comes back online,
 * when the tab becomes visible again, and every REFRESH_MS while open — always
 * silently in the background; offline reading is never blocked. When the
 * ACTIVE event's content actually changed, shows a quiet self-dismissing
 * "Program updated" toast. Renders nothing otherwise.
 */

import { useEffect, useRef, useState } from "react";
import { refreshSyncedEvents } from "@/lib/event-sync";

const BOOT_DELAY_MS = 8_000; // let the first paint and preloader breathe
const REFRESH_MS = 15 * 60 * 1_000;
const MIN_GAP_MS = 60_000; // throttle visibility/online bursts
const TOAST_MS = 5_000;

export function UpdateAgent() {
  const [toast, setToast] = useState<string | null>(null);
  const running = useRef(false);
  const lastRun = useRef(0);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    let disposed = false;

    async function tick(force = false) {
      if (running.current) return;
      if (!force && Date.now() - lastRun.current < MIN_GAP_MS) return;
      running.current = true;
      lastRun.current = Date.now();
      try {
        const { activeUpdated } = await refreshSyncedEvents();
        if (!disposed && activeUpdated) {
          setToast("Program updated");
          if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
          hideTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
        }
      } finally {
        running.current = false;
      }
    }

    const bootTimer = window.setTimeout(() => tick(true), BOOT_DELAY_MS);
    const interval = window.setInterval(() => tick(true), REFRESH_MS);
    const onOnline = () => tick();
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      disposed = true;
      window.clearTimeout(bootTimer);
      window.clearInterval(interval);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!toast) return null;

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div className="rounded-full bg-[#2f62b6] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-900/20">
        {toast}
      </div>
    </div>
  );
}
