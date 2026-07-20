"use client";

/**
 * Push-notification registration against the backend `devices` endpoint.
 * Native (Capacitor) only — every function no-ops in the browser/PWA.
 * Sending (APNs/FCM server side) comes with the messaging phase; this stores
 * the device token so the backend can reach this device later.
 */

import { apiUrl } from "@/lib/backend";
import { getSession } from "@/lib/auth";

const TOKEN_KEY = "ssa-push-token";

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
  if (!session) return false;

  const response = await fetch(apiUrl("devices"), {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify({ platform, token }),
  });

  return response.ok;
}

/**
 * Request permission and register this device's push token with the backend.
 * Safe to call repeatedly (the backend upserts by token).
 */
export async function enablePush(): Promise<void> {
  const native = await nativePush();
  if (!native) return;

  const { PushNotifications, platform } = native;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== "granted") return;

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

/** Unregister the stored token from the backend (called on sign-out). */
export async function disablePush(): Promise<void> {
  const native = await nativePush();
  if (!native) return;

  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  await sendDevice("DELETE", native.platform, token).catch(() => {});
  window.localStorage.removeItem(TOKEN_KEY);
}
