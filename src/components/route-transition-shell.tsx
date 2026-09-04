"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { navDirection, type NavDirection } from "@/lib/route-transition";

type Screen = {
  path: string;
  direction: NavDirection;
  /** false only between the route changing and the next animation frame. */
  entered: boolean;
};

/**
 * Slides each new screen into place, in the direction of the navigation:
 * deeper comes from the right, back from the left, peer screens (the bottom
 * tabs) rise slightly. See lib/route-transition.ts for why it never animates
 * opacity, and why there is no exit animation.
 *
 * The direction comes from the previous path, so navigation needs no
 * instrumentation — plain links stay plain links.
 *
 * The offset is derived **during render**, not in an effect. Deriving it after
 * the commit made the screen paint in place and then jump to the offset, and a
 * ref guard combined with StrictMode's double-invoked effects could leave it
 * offset for good. Reading it from state on every render cannot get stuck: the
 * frame that follows always resolves it.
 */
export function RouteTransitionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [screen, setScreen] = useState<Screen>({ path: pathname, direction: "cross", entered: true });

  if (screen.path !== pathname) {
    setScreen({ path: pathname, direction: navDirection(screen.path, pathname), entered: false });
  }

  useEffect(() => {
    if (screen.entered) return;

    const frame = window.requestAnimationFrame(() => {
      setScreen((current) => (current.entered ? current : { ...current, entered: true }));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [screen.entered]);

  return (
    <div className={`route-transition-shell nav-${screen.direction} ${screen.entered ? "is-entered" : ""}`}>
      {children}
    </div>
  );
}
