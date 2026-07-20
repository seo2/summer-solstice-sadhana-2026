"use client";

/**
 * Native-only background agent: once the user is signed in, registers this
 * device for push notifications with the backend (`devices` endpoint).
 * No-ops in the browser/PWA and while signed out.
 */

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { enablePush } from "@/lib/push";

export function PushAgent() {
  const auth = useAuth();
  const registered = useRef(false);

  useEffect(() => {
    if (!auth || registered.current) return;
    registered.current = true;
    enablePush().catch(() => {
      // Push unavailable (browser, permission denied, APNs/FCM unset) — fine.
    });
  }, [auth]);

  return null;
}
