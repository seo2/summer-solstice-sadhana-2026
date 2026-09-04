"use client";

/**
 * Background agent: keeps the Home feed (events catalog + posts) fresh over
 * the internet. Triggers shortly after app start (staggered behind the
 * bundle and alerts agents), when connectivity returns, when the tab becomes
 * visible again, and every REFRESH_MS while open. Renders nothing; failures
 * are silent — Home renders whatever was stored last, or just the built-in
 * event on a fresh offline install.
 */

import { useEffect, useRef } from "react";
import { refreshHomeFeed } from "@/lib/home-feed";

const BOOT_DELAY_MS = 10_000;
const REFRESH_MS = 30 * 60 * 1_000;
const MIN_GAP_MS = 60_000;

export function HomeFeedAgent() {
  const running = useRef(false);
  const lastRun = useRef(0);

  useEffect(() => {
    async function tick(force = false) {
      if (running.current) return;
      if (!force && Date.now() - lastRun.current < MIN_GAP_MS) return;
      running.current = true;
      lastRun.current = Date.now();
      try {
        await refreshHomeFeed();
      } catch {
        // Backend unreachable — the next trigger retries.
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
      window.clearTimeout(bootTimer);
      window.clearInterval(interval);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
