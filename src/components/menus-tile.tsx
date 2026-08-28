"use client";

/**
 * Home quick tile for the Menus page — appears only when the active synced
 * event actually has menu content, so the built-in event's Home is unchanged.
 */

import { UtensilsCrossed } from "lucide-react";
import { AppLink as Link } from "@/components/app-link";
import { bundleMenus, useActiveSyncedEvent } from "@/lib/event-store";

export function MenusTile() {
  const synced = useActiveSyncedEvent();
  if (!synced || bundleMenus(synced.bundle).length === 0) return null;

  return (
    <Link href="/menus" className="quick-tile group rounded-2xl p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#2f62b6] shadow-sm ring-1 ring-sky-100 transition group-hover:scale-105">
        <UtensilsCrossed className="h-6 w-6" />
      </div>
      <p className="mt-3 text-lg font-black text-slate-950">Menus</p>
      <p className="text-sm font-semibold capitalize text-slate-500">Daily meals</p>
    </Link>
  );
}
