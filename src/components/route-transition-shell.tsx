"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { onRouteExit, type NavDirection } from "@/lib/route-transition";

/**
 * Plays the screen transition: an exit requested by AppLink before the router
 * swaps the route, then an enter once the new screen mounts. The direction
 * decides which way things move — deeper slides in from the right, back slides
 * out to the right, peer screens cross-fade.
 *
 * `key={pathname}` remounts the subtree on every navigation, which is what
 * resets the enter animation.
 */
export function RouteTransitionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [entered, setEntered] = useState(false);
  const [direction, setDirection] = useState<NavDirection>("cross");
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    onRouteExit((next) => {
      setDirection(next);
      setExiting(true);
    });

    return () => onRouteExit(null);
  }, []);

  useEffect(() => {
    // The new route is mounting: drop the exit state and play the enter.
    setExiting(false);
    setEntered(false);
    const frame = window.requestAnimationFrame(() => setEntered(true));

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  const state = exiting ? "is-exiting" : entered ? "is-entered" : "";

  return (
    <div key={pathname} className={`route-transition-shell nav-${direction} ${state}`}>
      {children}
    </div>
  );
}
