"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

export function RouteTransitionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setEntered(false);
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div key={pathname} className={`route-transition-shell ${entered ? "route-transition-shell-entered" : ""}`}>
      {children}
    </div>
  );
}
