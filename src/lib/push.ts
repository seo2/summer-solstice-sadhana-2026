"use client";

/**
 * Push-notification registration against the backend `devices` endpoint
 * (public since plugin v0.5.0 — a bearer token is optional and only associates
 * the device with the account). Native (Capacitor) only for the actual token;
 * the notification PREFERENCES live locally on every platform:
 *   news   — future-event announcements (N1), OFF until the user opts in
 *   alerts — during-event urgent alerts (N3), on by default
 * Registration is an upsert by token, so it is safe to refresh on sign-in,
 * sign-out (device stays reachable anonymously), preference changes, and
 * active-event changes (alert audience targeting).
 */

import { apiUrl } from "@/lib/backend";
import { getSession } from "@/lib/auth";
import { getActiveEventSlug } from "@/lib/event-store";
import { BUILTIN_EVENT_SLUG } from "@/lib/messages";
import { CACHE_NAME } from "@/components/offline-preloader";

const TOKEN_KEY = "ssa-push-token";
const PREFS_KEY = "ssa-notify-prefs";

export type NotificationPrefs = { news: boolean; alerts: boolean };

const DEFAULT_PREFS: NotificationPrefs = { news: false, alerts: true };

export function getNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    return { news: Boolean(parsed.news), alerts: parsed.alerts !== false };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function setNotificationPrefs(update: Partial<NotificationPrefs>): NotificationPrefs {
  const next = { ...getNotificationPrefs(), ...update };
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — prefs stay in-memory defaults.
  }
  return next;
}

async function nativePush() {
  if (typeof window === "undefined") return null;
  const capacitor = await import("@capacitor/core");
  if (!capacitor.Capacitor.isNativePlatform()) return null;
  const platform = capacitor.Capacitor.getPlatform() as "ios" | "android";
  const { PushNotifications } = await import("@capacitor/push-notifications");
  return { PushNotifications, platform };
}

async function sendDevice(method: "POST" | "DELETE", platform: string, token: string): Promise<boolean> {
  const session = await getSession();
  const prefs = getNotificationPrefs();
  const activeSlug = await getActiveEventSlug().catch(() => null);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session) headers.Authorization = `Bearer ${session.token}`;

  const response = await fetch(apiUrl("devices"), {
    method,
    headers,
    body: JSON.stringify({
      platform,
      token,
      prefs,
      event: activeSlug ?? BUILTIN_EVENT_SLUG,
      appVersion: CACHE_NAME,
    }),
  });

  return response.ok;
}

async function wireAndRegister(native: NonNullable<Awaited<ReturnType<typeof nativePush>>>) {
  const { PushNotifications, platform } = native;

  await PushNotifications.removeAllListeners();

  await PushNotifications.addListener("registration", (token) => {
    window.localStorage.setItem(TOKEN_KEY, token.value);
    sendDevice("POST", platform, token.value).catch(() => {});
  });

  await PushNotifications.addListener("registrationError", () => {
    // APNs/FCM not configured yet or no connectivity — best effort.
  });

  await PushNotifications.register();
}

/**
 * Register without prompting: only when the OS permission is ALREADY granted
 * (the prompt happens in context — first favorite, or enabling a toggle).
 * Anonymous or signed-in alike.
 */
export async function registerPushIfPermitted(): Promise<void> {
  const native = await nativePush();
  if (!native) return;

  const permission = await native.PushNotifications.checkPermissions();
  if (permission.receive !== "granted") return;

  await wireAndRegister(native);
}

/**
 * In-context enable: request the OS permission (e.g. the user just turned a
 * notification toggle on), then register.
 */
export async function enablePush(): Promise<void> {
  const native = await nativePush();
  if (!native) return;

  const permission = await native.PushNotifications.requestPermissions();
  if (permission.receive !== "granted") return;

  await wireAndRegister(native);
}

/**
 * Re-send the stored token with the current auth/prefs/active event — used
 * after sign-in, sign-out (device becomes anonymous), preference changes, and
 * event switches. Falls back to a permission-gated fresh registration when no
 * token is stored yet.
 */
export async function refreshPushRegistration(): Promise<void> {
  const native = await nativePush();
  if (!native) return;

  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) {
    await registerPushIfPermitted();
    return;
  }

  await sendDevice("POST", native.platform, token).catch(() => {});
}

/** Fully unregister this device (stops all push, including anonymous). */
export async function disablePush(): Promise<void> {
  const native = await nativePush();
  if (!native) return;

  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  await sendDevice("DELETE", native.platform, token).catch(() => {});
  window.localStorage.removeItem(TOKEN_KEY);
}
