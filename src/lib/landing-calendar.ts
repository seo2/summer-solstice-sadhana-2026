/**
 * "Add dates to calendar" for a landing: the calendar file the landing names
 * (`calendarUrl`) or, failing that, an all-day .ics built on the device from
 * `startDate` / `endDate` / `location` and served as a data: URL. Everything
 * is deterministic (no "now" timestamp), so the server-rendered link and the
 * hydrated one are identical. Plain module — used by the server-rendered
 * template and by the client landing page alike.
 */

import type { Landing } from "@/lib/landings";

export type LandingCalendar = { href: string; fileName: string };

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (match) => `\\${match}`);
}

/** RFC 5545: lines longer than 75 octets continue on the next line after a space. */
function fold(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  parts.push(rest);
  return parts.join("\r\n");
}

const compact = (date: string) => date.replace(/-/g, "");

/** The day after an ISO date (all-day DTEND is exclusive). */
function nextDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return next.toISOString().slice(0, 10);
}

export function buildLandingIcs(landing: Landing & { startDate: string }): string {
  const end = landing.endDate && landing.endDate >= landing.startDate ? landing.endDate : landing.startDate;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//3HO//3HO Event App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${landing.id}@3ho.org`,
    `DTSTAMP:${compact(landing.startDate)}T000000Z`,
    `DTSTART;VALUE=DATE:${compact(landing.startDate)}`,
    `DTEND;VALUE=DATE:${compact(nextDay(end))}`,
    `SUMMARY:${escapeText(landing.title)}`,
  ];
  if (landing.location) lines.push(`LOCATION:${escapeText(landing.location)}`);
  const description = landing.tagline ?? landing.summary;
  if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
  if (landing.cta?.url) lines.push(`URL:${landing.cta.url}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function landingCalendar(landing: Landing): LandingCalendar | undefined {
  const fileName = `${landing.id}.ics`;
  if (landing.calendarUrl) return { href: landing.calendarUrl, fileName };
  if (!landing.startDate) return undefined;
  const ics = buildLandingIcs({ ...landing, startDate: landing.startDate });
  return { href: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`, fileName };
}
