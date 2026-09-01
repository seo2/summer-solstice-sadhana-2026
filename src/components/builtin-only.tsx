"use client";

/**
 * Renders its children only while the BUILT-IN event is active — used to hide
 * Summer-Solstice-specific surfaces (e.g. the Women's Renewal promo on Home)
 * while a synced event is active, so nothing on screen belongs to the wrong
 * event. Children are server-rendered and simply not shown when gated.
 */

import type { ReactNode } from "react";
import { useActiveSyncedEvent } from "@/lib/event-store";

export function BuiltinOnly({ children }: { children: ReactNode }) {
  const synced = useActiveSyncedEvent();
  if (synced) return null;
  return <>{children}</>;
}
