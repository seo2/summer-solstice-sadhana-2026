"use client";

/**
 * Native-only background agent for push registration. Since plugin v0.5.0 the
 * backend accepts anonymous devices, so this no longer waits for sign-in:
 *  - on app start, registers if the OS permission is already granted (the
 *    permission prompt itself happens in context — first favorite, or turning
 *    a notification toggle on);
 *  - on sign-in/sign-out, re-registers so the token attaches to / detaches
 *    from the account;
 *  - on active-event changes, re-registers so alert targeting follows the
 *    event the attendee is actually viewing.
 * No-ops entirely in the browser/PWA.
 */

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useActiveSyncedEvent } from "@/lib/event-store";
import { refreshPushRegistration, registerPushIfPermitted } from "@/lib/push";

export function PushAgent() {
  const auth = useAuth();
  const active = useActiveSyncedEvent();
  const activeSlug = active ? active.slug : null;
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    registerPushIfPermitted().catch(() => {
      // Push unavailable (browser, permission not granted, APNs/FCM unset) — fine.
    });
  }, []);

  // Re-register when the account or the active event changes.
  useEffect(() => {
    if (!booted.current) return;
    refreshPushRegistration().catch(() => {});
  }, [auth?.token, activeSlug]);

  return null;
}
