"use client";

/**
 * Header bell: entry point to the Announcements & Alerts feed with an unread
 * badge (locally tracked read cursor, so it works logged out and offline).
 */

import { Bell } from "lucide-react";
import { AppLink as Link } from "@/components/app-link";
import { useActiveSyncedEvent } from "@/lib/event-store";
import { broadcastContext, useUnreadCount } from "@/lib/messages";

export function AnnouncementsBell() {
  const active = useActiveSyncedEvent();
  const { eventSlug } = broadcastContext(active === undefined ? null : active);
  const unread = useUnreadCount(eventSlug);

  return (
    <Link
      href="/announcements"
      aria-label={unread > 0 ? `Announcements — ${unread} new` : "Announcements"}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#2f62b6] transition hover:bg-sky-50"
    >
      <Bell className="h-5 w-5" aria-hidden />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f39200] px-1 text-[10px] font-black leading-none text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
