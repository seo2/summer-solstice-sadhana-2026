"use client";

/**
 * Home digest of the Announcements & Alerts feed: the two newest messages for
 * the event being viewed, straight from the local store (offline-friendly),
 * with the unread count and a link to the full feed. Renders nothing until a
 * message exists, so a fresh install's Home stays calm.
 */

import { ChevronRight, Megaphone, TriangleAlert } from "lucide-react";
import { AppLink as Link } from "@/components/app-link";
import { useActiveSyncedEvent } from "@/lib/event-store";
import { BUILTIN_HOME_EVENT } from "@/lib/home-feed";
import { broadcastContext, useBroadcasts, useUnreadCount } from "@/lib/messages";

const SHOWN = 2;

function formatWhen(createdAt: string | null): string {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

/** `showEvent` names the event the messages belong to (the app Home lists several). */
export function HomeAnnouncements({ showEvent = false }: { showEvent?: boolean }) {
  const active = useActiveSyncedEvent();
  const { eventSlug } = broadcastContext(active === undefined ? null : active);
  const messages = useBroadcasts(eventSlug);
  const unread = useUnreadCount(eventSlug);

  if (messages.length === 0) return null;

  const eventName = active ? active.name : BUILTIN_HOME_EVENT.name;

  return (
    <section className="rounded-2xl border border-sky-900/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Megaphone className="h-4 w-4 shrink-0 text-[#f39200]" aria-hidden />
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-[#f39200]">Announcements</h2>
          {unread > 0 && (
            <span className="rounded-full bg-[#f39200] px-2 py-0.5 text-[10px] font-black leading-4 text-white">
              {unread > 9 ? "9+" : unread} new
            </span>
          )}
        </div>
        <Link href="/announcements" className="inline-flex shrink-0 items-center gap-0.5 text-xs font-black text-[#2f62b6]">
          See all
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {showEvent && <p className="mt-1 truncate text-xs font-semibold text-stone-500">{eventName}</p>}

      <ul className="mt-3 space-y-2.5">
        {messages.slice(0, SHOWN).map((message) => {
          const isAlert = message.channelType === "alert";
          const when = formatWhen(message.createdAt);
          return (
            <li
              key={message.gid}
              className={
                isAlert
                  ? "rounded-xl border-l-4 border-amber-400 bg-amber-50 px-3.5 py-3"
                  : "rounded-xl border-l-4 border-sky-200 bg-sky-50/60 px-3.5 py-3"
              }
            >
              <p className="line-clamp-3 whitespace-pre-line text-sm font-semibold leading-6 text-stone-800">{message.body}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-500">
                {isAlert && <TriangleAlert className="h-3.5 w-3.5 text-amber-600" aria-label="Alert" />}
                <span>
                  {message.authorName}
                  {when && <> · {when}</>}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
