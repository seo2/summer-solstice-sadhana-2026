"use client";

import { flushContactOutbox } from "@/lib/contact-outbox";
import { useEffect } from "react";

export function ContactOutboxSync() {
  useEffect(() => {
    let cancelled = false;

    const sync = () => {
      if (cancelled) return;
      flushContactOutbox().catch(() => {});
    };

    sync();
    window.addEventListener("online", sync);
    const interval = window.setInterval(sync, 45000);

    return () => {
      cancelled = true;
      window.removeEventListener("online", sync);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
