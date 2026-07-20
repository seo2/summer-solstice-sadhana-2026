"use client";

/**
 * Single source for the backend API origin (WordPress running the
 * 3ho-solstice-app plugin). A local override — set from /sync-lab — takes
 * precedence over the production origin, so dev/local WordPress works
 * without code changes.
 */

export const BACKEND_BASE_KEY = "ssa-sync-lab-base";

const PRODUCTION_BASE = "https://www.3ho.org";

export function getBackendBaseUrl(): string {
  if (typeof window !== "undefined") {
    const override = window.localStorage.getItem(BACKEND_BASE_KEY);
    if (override && override.trim()) {
      return override.trim().replace(/\/$/, "");
    }
  }
  return PRODUCTION_BASE;
}

export function apiUrl(path: string): string {
  return `${getBackendBaseUrl()}/wp-json/3ho-solstice/v1/${path.replace(/^\//, "")}`;
}
