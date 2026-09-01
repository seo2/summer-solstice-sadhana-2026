"use client";

/**
 * Background agent that brings the current event onto the device on first run.
 * Runs once per app start and again when connectivity comes back, since the
 * very first launch at camp is often offline. Renders nothing and never blocks
 * reading: the built-in event stays available throughout.
 */

import { useEffect, useRef } from "react";
import { adoptCurrentEvent } from "@/lib/event-discovery";

export function EventAdoptionAgent() {
  const running = useRef(false);

  useEffect(() => {
    async function attempt() {
      if (running.current) return;
      running.current = true;

      try {
        await adoptCurrentEvent();
      } catch {
        // Unreachable backend or bad payload — the built-in event still works.
      } finally {
        running.current = false;
      }
    }

    attempt();

    window.addEventListener("online", attempt);

    return () => window.removeEventListener("online", attempt);
  }, []);

  return null;
}
