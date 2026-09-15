"use client";

/**
 * Date range under the Program title. The static page bakes in the built-in
 * event's range, but when a synced event is active the schedule shown below
 * is that event's — so the range must follow it (found showing "Jun 19 – 27"
 * over the WSOL26 program). Prefers the bundle's event dates, falls back to
 * the synced program's first/last day, then to the built-in range.
 */

import { bundleActivities, useActiveSyncedEvent } from "@/lib/event-store";
import { formatDate } from "@/lib/utils";

function rangeLabel(start: string, end: string) {
  return start === end ? formatDate(start) : `${formatDate(start)} – ${formatDate(end)}`;
}

export function ProgramDateRange({ builtin }: { builtin: string }) {
  const synced = useActiveSyncedEvent();

  let label = builtin;
  if (synced) {
    const { startDate, endDate } = synced.bundle.event;
    if (startDate && endDate) {
      label = rangeLabel(startDate, endDate);
    } else {
      const dates = Array.from(new Set(bundleActivities(synced.bundle).map((activity) => activity.date))).sort();
      if (dates.length > 0) label = rangeLabel(dates[0], dates[dates.length - 1]);
    }
  }

  return <p className="mt-1 text-sm font-semibold text-stone-600">{label}</p>;
}
