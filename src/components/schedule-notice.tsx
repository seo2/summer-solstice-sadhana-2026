"use client";

/**
 * "Schedule subject to change" notice, in two forms:
 *  - ScheduleNoticeBanner — a dismissible strip at the top of the Program
 *    (dismissal remembered on the device; bump DISMISS_KEY to show it again);
 *  - ScheduleNoticeCard — the full wording as a permanent Info Hub card,
 *    linked from the banner. Plain, attendee-facing language: it states that
 *    the program can change, how updates reach the app, and that refunds and
 *    cancellations follow the registration terms — without restating them.
 */

import { useEffect, useState } from "react";
import { CalendarClock, ChevronRight, X } from "lucide-react";
import { AppLink as Link } from "@/components/app-link";

const DISMISS_KEY = "solstice-schedule-notice-dismissed-v1";

export const SCHEDULE_NOTICE_ID = "schedule-changes";

export const SCHEDULE_NOTICE_TITLE = "Schedule subject to change";

export const SCHEDULE_NOTICE_PARAGRAPHS = [
  "Session times, venues, presenters and activities may change before or during the event, including for weather, safety, presenter availability or other circumstances beyond our control. 3HO International reserves the right to modify, reschedule or cancel any part of the program.",
  "This app refreshes its content automatically whenever it has a connection, and important changes are posted in Announcements. Printed or shared schedules may be out of date; the app and on-site announcements take precedence.",
  "Registration, refunds and cancellations are governed by the terms accepted at registration.",
];

export function ScheduleNoticeBanner() {
  // Hidden until the stored preference is read, so a dismissed banner never
  // flashes on the server-rendered first paint.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(DISMISS_KEY) !== "true");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // Storage unavailable — the banner simply returns next time.
    }
    setVisible(false);
  }

  return (
    <div role="note" className="flex items-start gap-3 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3">
      <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-amber-900">{SCHEDULE_NOTICE_TITLE}</p>
        <p className="mt-0.5 text-xs font-semibold leading-5 text-amber-900/80">
          Times, venues and presenters may change before or during the event. Keep the app updated and check Announcements for the latest.
        </p>
        <Link
          href={`/info#${SCHEDULE_NOTICE_ID}`}
          className="mt-1.5 inline-flex min-h-8 items-center gap-0.5 text-xs font-black text-[#2f62b6]"
        >
          Details
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <button
        type="button"
        aria-label="Dismiss schedule notice"
        onClick={dismiss}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-amber-800 shadow-sm ring-1 ring-amber-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ScheduleNoticeCard() {
  return (
    <section
      id={SCHEDULE_NOTICE_ID}
      aria-labelledby={`${SCHEDULE_NOTICE_ID}-title`}
      className="scroll-mt-20 rounded-xl border border-amber-300/70 bg-amber-50 p-4 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <CalendarClock className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <h2 id={`${SCHEDULE_NOTICE_ID}-title`} className="text-lg font-black text-amber-900">
          {SCHEDULE_NOTICE_TITLE}
        </h2>
      </div>
      <div className="mt-2 space-y-2">
        {SCHEDULE_NOTICE_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-6 text-amber-950/85">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
