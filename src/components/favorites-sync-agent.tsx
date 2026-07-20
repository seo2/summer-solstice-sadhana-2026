"use client";

/**
 * Background agent: while logged in and online, pushes favorite changes to the
 * backend (debounced) and runs one reconciliation on app load. Renders nothing;
 * failures are silent — the next trigger retries. Offline behavior unchanged.
 */

import { useEffect, useRef } from "react";
import { useSavedActivities } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { syncFavorites } from "@/lib/favorites-sync";

const DEBOUNCE_MS = 4000;

export function FavoritesSyncAgent() {
  const auth = useAuth();
  const { favoriteIds } = useSavedActivities();
  const timer = useRef<number | null>(null);
  const bootSynced = useRef(false);
  const signature = Array.from(favoriteIds).sort().join("|");

  useEffect(() => {
    if (!auth) return;

    if (!bootSynced.current) {
      bootSynced.current = true;
      syncFavorites().catch(() => {});
      return;
    }

    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      syncFavorites().catch(() => {});
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, signature]);

  return null;
}
