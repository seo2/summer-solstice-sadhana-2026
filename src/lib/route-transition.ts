"use client";

/**
 * Screen transitions: the incoming screen slides into place, in the direction
 * the navigation is going.
 *
 * It animates transform only, never opacity. A screen that fades in has to
 * start invisible, and on a heavy route (Program renders 47 sessions) that
 * invisible state lasts as long as the render — which is what used to read as a
 * blank flash between screens. Opaque and moving cannot flash.
 *
 * There is deliberately no exit animation: the outgoing screen stays put until
 * the router swaps routes, so a tap navigates immediately instead of waiting
 * for an animation to finish.
 *
 * Not the View Transitions API: React 19.2 stable does not export
 * `<ViewTransition>`, so Next's `experimental.viewTransition` would mean
 * shipping React's experimental channel to the stores.
 */

/** How the two screens relate, which decides the direction of the motion. */
export type NavDirection = "forward" | "back" | "cross";

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
