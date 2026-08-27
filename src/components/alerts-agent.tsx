"use client";

/**
 * Background agent: polls the backend's cheap `/updates` endpoint for the
 * active event's official Announcements + Alerts and stores new messages
 * locally (the feed and the unread badge read from Dexie, offline-friendly).
 * Triggers: shortly after app start, back online, tab visible again, and
 * every POLL_MS while open. Renders nothing; failures are silent.
 */

import { useEffect, useRef } from "react";
import { useActiveSyncedEvent } from "@/lib/event-store";
import { broadcastContext, refreshBroadcasts } from "@/lib/messages";

const BOOT_DELAY_MS = 12_000; // staggered after the UpdateAgent's boot tick
const POLL_MS = 2 * 60 * 1_000;
const MIN_GAP_MS = 30_000;

export function AlertsAgent() {
  const active = useActiveSyncedEvent();
  const running = useRef(false);
  const lastRun = useRef(0);
  const context = broadcastContext(active === undefined ? null : active);

  useEffect(() => {
    async function tick(force = false) {
      if (running.current) return;
      if (!force && Date.now() - lastRun.current < MIN_GAP_MS) return;
      running.current = true;
      lastRun.current = Date.now();
      try {
        await refreshBroadcasts(context.baseUrl, context.eventSlug);
      } catch {
        // Backend unreachable — the next trigger retries.
      } finally {
        running.current = false;
      }
    }

    const bootTimer = window.setTimeout(() => tick(true), BOOT_DELAY_MS);
    const interval = window.setInterval(() => tick(true), POLL_MS);
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
  }, [context.baseUrl, context.eventSlug]);

  return null;
}
