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

## Screenshots

Required: iPhone 6.9" (1320×2868); iPad is disabled (iPhone-only target,
2026-09-14), so no iPad shots. Play: phone (16:9 or 9:16, ≥1080px).

**Draft set captured 2026-09-14** (8 shots, exact 1320×2868, iPhone 17 Pro Max
simulator, status bar staged to 9:41/full battery), mostly against the **live
production backend** — real WSOL26 program, map and menus:

1. App Home — hero + featured event card with countdown + past event.
2. Event Home — event hero with Open Program / Info Hub.
3. Program — day strip + session cards (favorited heart visible).
4. Session detail sheet with the red "Saved" state.
5. Venue map at 100% centered on ASTA with its pin + description callout.
6. Info Hub topic grid.
7. Announcements feed (alert + announcements — mock-seeded; production
   channels held no messages yet).
8. Daily menus — Wed day with Breakfast/Lunch cards (production has no dish
   records yet, so no dish sheet).

Redo the set once the **final icon/splash art** lands (same recipe:
[TESTING-LOCAL.md](TESTING-LOCAL.md) Level D, including the
mock-announcements trick) — and ideally with real announcements and dishes in
production so every shot is genuine content.
