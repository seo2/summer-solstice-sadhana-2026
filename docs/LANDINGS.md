# Landings — designed promo pages, from data

A **landing** is a promotional page for something 3HO wants attendees to know
about: a follow-on retreat (A Woman's Renewal Experience after Summer Solstice
2026 — the first one), a training, a special day. It is more than a post (a
post is a short note with one link) and less than an event (an event has a
program, teachers, a map). Like everything else in the app it is attendee-facing,
works offline once on the device, and **links out** for registration — the app
never sells anything itself (ROADMAP Phase 5).

Status (2026-09-08): **phases 1 and 2 shipped** (cache v86) — the template
exists, the Women's Renewal page renders from data, and the app already reads
`landings[]` from the Home feed: tiles on the Event Home and the App Home, the
shared `/landing#<id>` page, the reminder and a generated calendar file. Phase 3
(plugin P10) is what remains for staff to publish landings from wp-admin.

## One template, content only

The design lives in the code once, in `LandingView`
([`src/components/landing-view.tsx`](../src/components/landing-view.tsx)):
fixed section order, fixed colors and type, the same hero / cards / chips
language as the rest of the app. Staff supply **content only**. Every section
is optional and renders only when its content is there, so a landing with no
schedule simply has no schedule block — nothing shifts or breaks.

| Section (in order) | Fields | Renders as |
|---|---|---|
| **Hero** | `title`, `tagline`, `hero.image` + `hero.alt`, up to three `facts[]` (`icon`, `label`, `value`) | Full-bleed image under a white fade, display title, one-line tagline, fact cards (Dates · Venue · Rate) |
| **Actions** | `cta.url`, `cta.label`, `calendarUrl` (or `startDate` / `endDate` / `location`) | White card: online → "Register today" (opens outside the app); offline → disabled "Registration needs internet"; **Save reminder** (local opt-in); "Add dates to calendar" — the named `.ics`, or one built on the device from the dates ([`landing-calendar.ts`](../src/lib/landing-calendar.ts)); "View FAQ" when there is a FAQ. Only rendered when `cta` exists |
| **Highlights** | up to three `highlights[]` | Three small cards with a sparkle |
| **About** ("What you get") | `about.kicker`, `about.title`, `about.body` (plain-text grammar), `about.image` + `about.imageAlt`, `about.includes[]`, `about.callout` (`icon`, `title`, `body`) | Two-column card: photo · kicker, title, paragraphs, checklist, orange callout |
| **Schedule** | `schedule.kicker` (default "Program"), `schedule.title`, `schedule.days[]` (`label`, `date`, `title`, `items[]`) | One card per day: "Day 1 · Jun 29", focus title, activity chips |
| **People** | `people.kicker` (default "Teachers"), `people.title`, `people.items[]` (`name`, `role`, `photo`) | Two-column cards with a rounded photo (initials when missing) |
| **Banner** | `banner.title`, `banner.body`, `banner.linkLabel`, `banner.linkUrl` | Deep-blue card with a white button; a `#…` link scrolls, an `http(s)` link opens outside |
| **FAQ** | `faq.kicker` (default "FAQ"), `faq.title`, `faq.items[]` (`question`, `answer` in the plain-text grammar, `links[]`) | Accordions, the first one open; link chips under an answer |

Tile (event home): `kicker`, `title`, `summary`, `cardImage` (falls back to the
hero image) + `cardImageAlt` → `LandingTile`
([`src/components/landing-tile.tsx`](../src/components/landing-tile.tsx)).

Icons a landing may name (`facts[].icon`, `about.callout.icon`): `calendar`,
`map-pin`, `heart`, `clock`, `sparkles`, `utensils`, `users`, `tag`, `info`,
`sun`. Unknown names fall back to a sparkle (facts) or the info glyph (callout).

## The contract (`Landing`)

Source of truth: the `Landing` type in
[`src/lib/landings.ts`](../src/lib/landings.ts). The built-in Women's Renewal
entry in [`src/data/landings.json`](../src/data/landings.json) is a complete
worked example; abbreviated:

```json
{
  "id": "womens-renewal-2026",
  "eventSlug": "summer-solstice-2026",
  "path": "/womens-renewal",
  "status": "published",
  "kicker": "After Solstice",
  "title": "A Woman's Renewal Experience",
  "tagline": "Continue your Solstice journey with three days of practice, rest and integration.",
  "summary": "June 29-July 1. Save the details offline and register when you are online.",
  "startDate": "2026-06-29",
  "endDate": "2026-07-01",
  "location": "Hacienda Guru Ram Das Ashram, Espanola, NM",
  "hero": { "image": "/images/womens-renewal/hero.jpg", "alt": "…" },
  "cardImage": "/images/womens-renewal/circle.jpg",
  "facts": [{ "icon": "calendar", "label": "Dates", "value": "June 29-July 1, 2026" }],
  "cta": { "url": "https://registration.3ho.org/…", "label": "Register today" },
  "calendarUrl": "/womens-renewal-2026.ics",
  "highlights": ["A place to exhale after the intensity of Solstice."],
  "about": { "kicker": "What you get", "title": "…", "body": "…", "image": "…", "includes": ["…"], "callout": { "icon": "utensils", "title": "…", "body": "…" } },
  "schedule": { "kicker": "Program", "title": "Three-day flow", "days": [{ "label": "Day 1", "date": "Jun 29", "title": "Reset and refill", "items": ["Sadhana", "Breathwalk"] }] },
  "people": { "kicker": "Teachers", "title": "…", "items": [{ "name": "Shakta Kaur", "role": "…", "photo": "…" }] },
  "banner": { "title": "Member savings", "body": "…", "linkLabel": "Read the FAQ", "linkUrl": "#landing-faq" },
  "faq": { "kicker": "FAQ", "title": "…", "items": [{ "question": "Is lodging included?", "answer": "No. …", "links": [{ "label": "LYF Rentals", "href": "https://…" }] }] }
}
```

Metadata that is not rendered but drives behaviour:

| Field | Meaning |
|---|---|
| `id` | Stable string id; also the prefix of the device's storage keys (`<id>-interest`, `<id>-online-dismissed`) |
| `eventSlug` | **Scope.** Set → the landing is listed on that event's home. Absent → the app's Home ("Featured") |
| `path` | Static route of a **built-in** landing (`/womens-renewal`). Synced landings have none and open at `/landing#<id>`; the backend never sends `path` |
| `status` | `published` (default) or `draft` — drafts never render |
| `pinned` | Featured on the **App Home** even when scoped to an event; pinned landings also sort first wherever they are listed |
| `publishedAt` | ISO timestamp; newest first after pinned |
| `startDate`, `endDate`, `location` | ISO dates; the generated calendar file (all-day, `DTEND` exclusive) uses them when there is no `calendarUrl`. The visible dates are whatever the `facts` say |

## Where landings appear

- **Event Home (`/event`)** — one `LandingTile` per published landing whose
  `eventSlug` is the event being viewed. Built-in landings are rendered on the
  server inside the `BuiltinOnly` gate, so a synced event never shows Summer
  Solstice promos; `SyncedLandingTiles`
  ([`src/components/synced-landing-tiles.tsx`](../src/components/synced-landing-tiles.tsx))
  adds the store's landings for the active slug — including new ones the
  backend scopes to the built-in event, minus any that repeat a built-in id.
- **App Home (`/`)** — `HomeFeatured`
  ([`src/components/home-featured.tsx`](../src/components/home-featured.tsx)):
  landings for everyone (no `eventSlug`) plus pinned ones, as tiles under
  "Featured", above News & posts. Nothing until one exists.
- **Full page** — built-in landings at their `path` (server-rendered, in the
  offline preload list and the navigation warm-up). Everything else opens at
  **`/landing#<id>`** ([`src/app/landing/page.tsx`](../src/app/landing/page.tsx)
  → `LandingPage`): the id travels in the **hash**, not a query string, so the
  service worker's cache key stays `/landing` and a hard reload offline still
  finds the page the preloader cached. The client reads the hash on mount and
  on `hashchange`, looks the id up in the built-in list then the store, sets
  `document.title`, and shows a quiet "not on your device yet" card for an
  unknown id (nothing at all while the store is still opening).
- **Reminder banner** — `LandingReminder`
  ([`src/components/landing-reminder.tsx`](../src/components/landing-reminder.tsx)),
  mounted in the root layout: once the attendee tapped **Save reminder** and the
  device is online, a fixed banner offers **Register** and **View details**
  until dismissed. Personal opt-in, so it is **not** gated by the active
  event. Keys are per landing, so several can be saved; candidates are the
  built-in landings plus the store's.

## Two sources, one renderer

| | Built-in | Synced |
|---|---|---|
| Content | `src/data/landings.json` + images in `public/images/<landing>/` | `landings[]` in the Home feed (`GET /home`), normalized by `normalizeLanding()` and stored in the `solstice-home-feed` Dexie DB (v2) next to `posts`; replaced whole on every refresh |
| Reaches the device | In the static export | Background refresh (`HomeFeedAgent`), images warmed into the offline cache |
| Offline assets | `landingAssets()` lists a built-in landing's local images and calendar file for the preloader — **no manual `staticAssets` edit** when adding a landing | Absolute Media Library URLs, pre-cached at fetch time like post images |
| Updated by | An app release | Saving in wp-admin; no `content_version` bump involved (the feed is event-independent) |

`normalizeLanding()` keeps a landing whenever `id` and `title` are there and
cleans everything else field by field: a fact without label or value, a person
without a name, a FAQ entry without question or answer, an unknown icon name —
each is dropped on its own, never the landing. Like the other normalizers it is
silent: check that the landing shows up, not just that the screen renders. A
backend that predates landings publishes no `landings` key; the app treats that
as an empty list.

## Authoring conventions

- Prose fields (`about.body`, `faq[].answer`) use the **plain-text grammar**
  shared with info pages and posts ([`src/lib/plain-text.ts`](../src/lib/plain-text.ts)):
  a blank line starts a paragraph, a line starting with `∙ • — -` is a bullet.
  No markup.
- At most **three** facts and three highlights are shown; extra ones are ignored.
- Every image needs an `alt`; people photos use the person's name.
- Keep 3HO terminology exact (WTY®, White Tantric Yoga®, Sadhana, Gurdwara) and
  the copy attendee-facing — no internal labels.
- In wp-admin (phase 3) repeated things are typed **one per line**, compound
  rows with `|` — the convention the Import screen's CSVs already use.

## Plan

1. **Phase 1 — template ✅ (2026-09-08, cache v85).** `LandingView`,
   `LandingTile`, `LandingActions`, `LandingReminder`, the `Landing` type and
   `src/data/landings.json`; the Women's Renewal page and the promo card on the
   Event Home render from data with the same look. Storage keys unchanged
   (`womens-renewal-2026-interest`), so saved reminders survive.
2. **Phase 2 — synced landings (app) ✅ (2026-09-08, cache v86).**
   `landings[]` in [`home-feed.ts`](../src/lib/home-feed.ts) (Dexie v2,
   `normalizeLanding()`, `useHomeLandings()`), `landingsForEvent()` /
   `featuredLandings()` / `mergeLandings()` in `landings.ts`,
   `SyncedLandingTiles` on the Event Home, `HomeFeatured` on the App Home, the
   `/landing#<id>` page, the reminder reading the store too, the generated
   `.ics`, and two landings in `scripts/fixtures/home.json` (one scoped to
   `wsol26`, one pinned for everyone) served by the mock. Built and testable
   before the plugin exists — see "Testing locally" below.
3. **Phase 3 — plugin P10.** `ssa_landing`, an *Event App → Landings* screen,
   `landings[]` in `GET /home`, a `landings` import type — see
   [BACKEND-WSOL26.md](BACKEND-WSOL26.md) P10.

## Testing locally

```bash
npm run mock-backend        # GET /home now carries landings[] from scripts/fixtures/home.json
npm run dev -- -p 3011
```

Point the app at the mock (`/sync-lab` → base `http://localhost:3999`). Within
~10 s the App Home shows **Featured** with "Level One Teacher Training 2027"
(pinned, for everyone); open Winter Solstice → its Event Home shows the "Gong &
Sound Immersion" tile; **See details** opens `/landing#landing-wsol26-gong-immersion`
with every section filled; **Save reminder** raises the banner. Edit the
fixture (re-read on every request) and tap refresh on `/news`, or wait for the
agent.

Verification for any change here: `npm run typecheck && npm run lint && npm run
build`, then confirm `out/womens-renewal.html` still carries the landing's text,
`out/event.html` the tile and `out/landing.html` exists, and open the pages in a
mobile viewport.
