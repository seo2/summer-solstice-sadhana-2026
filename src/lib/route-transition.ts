"use client";

/**
 * Screen transitions: play a short exit on the current screen before the router
 * swaps it, so navigation reads as movement instead of a flash.
 *
 * Why not the View Transitions API: it needs either React's experimental
 * `<ViewTransition>` (React 19.2 stable does not export it, and the app ships to
 * the stores) or a raw `document.startViewTransition` around `router.push`,
 * whose snapshot timing is unreliable with the App Router. A CSS exit/enter pair
 * behaves identically on every iOS and Android version the app supports.
 *
 * AppLink asks for the exit and awaits it; RouteTransitionShell plays it.
 */

/** How the two screens relate, which decides the direction of the motion. */
export type NavDirection = "forward" | "back" | "cross";

/** Kept in sync with the animation durations in globals.css. */
export const EXIT_MS = 110;

type ExitListener = (direction: NavDirection) => void;

let listener: ExitListener | null = null;

/** RouteTransitionShell registers itself here; only one shell is ever mounted. */
export function onRouteExit(next: ExitListener | null) {
  listener = next;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Where the navigation sits relative to the current screen:
 *  - into a child route ("/program" → "/program/x") reads as going deeper;
 *  - out to an ancestor reads as coming back;
 *  - anything else is a peer, like switching tabs in the bottom bar.
 */
export function navDirection(from: string, to: string): NavDirection {
  const current = normalize(from);
  const next = normalize(to);

  if (current === next) return "cross";

  // Home is the app's root: anything opened from it goes deeper, and anything
  // that returns to it comes back.
  if (next === "/") return "back";
  if (current === "/") return "forward";

  if (next.startsWith(`${current}/`)) return "forward";
  if (current.startsWith(`${next}/`)) return "back";

  return "cross";
}

function normalize(path: string): string {
  const clean = path.split("?")[0].split("#")[0];

  return clean.length > 1 && clean.endsWith("/") ? clean.slice(0, -1) : clean;
}

/**
 * Play the exit and resolve when it is done, so the caller can navigate into a
 * screen that is already off-stage. Resolves immediately when there is no shell
 * listening or the visitor asked for reduced motion.
 */
export function requestRouteExit(direction: NavDirection): Promise<void> {
  if (!listener || prefersReducedMotion()) return Promise.resolve();

  listener(direction);

  return new Promise((resolve) => window.setTimeout(resolve, EXIT_MS));
}
