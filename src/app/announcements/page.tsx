"use client";

/**
 * Announcements & Alerts feed (messaging phase 3a): official posts from the
 * event team, newest first. Reads from the local store, so everything already
 * fetched is available offline; the AlertsAgent keeps it fresh while online.
 * Opening this page clears the unread badge (local read cursor).
 */

import { useEffect, useState } from "react";
import { Megaphone, RefreshCw, TriangleAlert } from "lucide-react";
import { ActiveEventBanner } from "@/components/active-event-banner";
import { useActiveSyncedEvent } from "@/lib/event-store";
import {
  broadcastContext,
  markBroadcastsRead,
  refreshBroadcasts,
  useBroadcasts,
  type BroadcastMessage,
} from "@/lib/messages";

function formatWhen(createdAt: string | null): string {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function MessageCard({ message }: { message: BroadcastMessage }) {
  const isAlert = message.channelType === "alert";
  return (
    <article
      className={
        isAlert
          ? "rounded-2xl border border-amber-300/80 bg-amber-50 p-4 shadow-sm"
          : "rounded-2xl border border-sky-900/10 bg-white p-4 shadow-sm"
      }
    >
      <div className="flex items-center gap-2">
        {isAlert ? (
          <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        ) : (
          <Megaphone className="h-4 w-4 shrink-0 text-[#2f62b6]" aria-hidden />
        )}
        <p
          className={
            isAlert
              ? "text-xs font-black uppercase tracking-[0.14em] text-amber-700"
              : "text-xs font-black uppercase tracking-[0.14em] text-[#2f62b6]"
          }
        >
          {isAlert ? "Alert" : "Announcement"}
        </p>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-stone-700">{message.body}</p>
      <p className="mt-2 text-xs font-semibold text-stone-400">
        {message.authorName}
        {formatWhen(message.createdAt) && <> · {formatWhen(message.createdAt)}</>}
      </p>
    </article>
  );
}

export default function AnnouncementsPage() {
  const active = useActiveSyncedEvent();
  const context = broadcastContext(active === undefined ? null : active);
  const messages = useBroadcasts(context.eventSlug);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      markBroadcastsRead(context.eventSlug).catch(() => {});
    }
  }, [context.eventSlug, messages.length]);

  async function refreshNow() {
    setRefreshing(true);
    try {
      await refreshBroadcasts(context.baseUrl, context.eventSlug);
    } catch {
      // Offline or unreachable — the stored feed below stays available.
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-4">
      <ActiveEventBanner />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f39200]">From the event team</p>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-[#2f62b6]">Announcements</h1>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            Official announcements and urgent alerts. Saved on your device once received.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshNow}
          disabled={refreshing}
          aria-label="Check for new announcements"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#2f62b6] shadow-sm ring-1 ring-sky-900/10 transition hover:bg-sky-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-sky-900/10 bg-white p-6 text-center shadow-sm">
          <Megaphone className="mx-auto h-8 w-8 text-sky-200" aria-hidden />
          <p className="mt-3 text-sm font-bold text-stone-600">No announcements yet</p>
          <p className="mt-1 text-xs font-semibold text-stone-400">
            Official news and alerts from the event team will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageCard key={message.gid} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
