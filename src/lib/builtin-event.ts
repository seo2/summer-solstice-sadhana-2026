/**
 * The slug of the event bundled with the app (src/data/*.json). Plain module
 * on purpose — no "use client" — so server components (static export) and
 * client modules can both read it; messages.ts re-exports it for the client
 * code that already imports it from there.
 */
export const BUILTIN_EVENT_SLUG = "summer-solstice-2026";
