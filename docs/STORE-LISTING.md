# Store Listing Copy — 3HO Event App

Ready-to-paste texts for App Store Connect and Google Play Console. English,
attendee-facing, accurate to the app as of cache v88 (no accounts, offline-first).
Character limits noted per field. Prepared 2026-09-14.

## Identity

| Field | Value |
|---|---|
| App name (both stores) | `3HO Event App` |
| Bundle / package id | `org.threeho.eventapp` |
| Apple subtitle (≤30) | `Your 3HO event, offline` |
| Apple primary category | Lifestyle (secondary: Travel) |
| Play category | Events |
| Age rating | 4+ / Everyone |
| Support URL | `https://www.3ho.org` |
| Privacy policy URL | `https://<final-domain>/privacy` ⚠️ decide the public domain |

## Play short description (≤80 chars)

```
Program, maps, menus & announcements for 3HO events — works fully offline.
```

## Full description (both stores)

```
The official companion app for 3HO events — starting with Winter Solstice
Sadhana Celebration 2026 (December 15–21, Lake Wales, Florida).

Everything you need on site, working even with no signal:

• FULL PROGRAM — browse every session by day, search, and filter by venue,
  category or time of day.
• YOUR AGENDA — mark favorites and get a reminder 15 minutes before each one.
  If a favorited session changes time or venue, the app tells you.
• TEACHERS — profiles and photos of every teacher and musician, with the
  sessions they lead.
• VENUE MAP — a zoomable map of the grounds with every venue marked.
• DAILY MENUS — what the kitchen is serving each day, with dish details,
  ingredients and dietary notes.
• ANNOUNCEMENTS & ALERTS — official news from the event team, plus urgent
  notices delivered as notifications.
• INFO HUB — arrival details, camp life, practices and FAQs, readable offline.

Offline-first by design: load the app once and everything keeps working
without connectivity. No account needed, no ads, no tracking.

New 3HO events appear in the app as they are published — one app for every
gathering.
```

## Apple promotional text (≤170 chars)

```
Winter Solstice Sadhana 2026 — Dec 15–21, Lake Wales, FL. Full program, venue
map, menus and live announcements, all working without signal.
```

## Apple keywords (≤100 chars, comma-separated, no spaces)

```
3HO,solstice,kundalini,yoga,sadhana,festival,retreat,schedule,event,winter,meditation,camp
```

## What's New — v1.0 (both stores)

```
First release: full program with favorites and reminders, teachers, venue map,
daily menus, announcements and the offline Info Hub — ready for Winter
Solstice Sadhana Celebration 2026.
```

## Review notes (paste into both stores)

```
This is an offline-first event guide. There is NO sign-in and NO account —
every feature is available immediately on first launch, so no demo credentials
are needed. Commerce links out to the organization's existing ticketing
website; there are no in-app purchases. Notification permission is requested
in context (when the user favorites a session or enables a notification
toggle), never at launch. Content is loaded from the organization's WordPress
backend and cached on the device for offline use.
```

## Screenshots (to produce)

Required: iPhone 6.9" (1320×2868) — and iPad 13" only if iPad stays enabled;
Play: phone (16:9 or 9:16, ≥1080px). Suggested set, using the WSOL26 fixture:

1. App Home — featured event hero with countdown.
2. Program — day strip + session cards.
3. Session detail with favorite + reminder.
4. Venue map with pins, mid-zoom.
5. Daily menus with a dish card open.
6. Announcements feed (alert + announcement).
7. Info Hub topics.

They can be captured headlessly from the simulator (toolchain in
[TESTING-LOCAL.md](TESTING-LOCAL.md) Level D) once the final icon/splash are in.
