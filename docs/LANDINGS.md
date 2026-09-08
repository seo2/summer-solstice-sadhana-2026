# Landings — designed promo pages, from data

A **landing** is a promotional page for something 3HO wants attendees to know
about: a follow-on retreat (A Woman's Renewal Experience after Summer Solstice
2026 — the first one), a training, a special day. It is more than a post (a
post is a short note with one link) and less than an event (an event has a
program, teachers, a map). Like everything else in the app it is attendee-facing,
works offline once on the device, and **links out** for registration — the app
never sells anything itself (ROADMAP Phase 5).

Status (2026-09-08): **phase 1 shipped** (cache v85) — the template exists and
the Women's Renewal page renders from data. Phases 2 and 3 below make landings
publishable from wp-admin without an app release.

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
| **Actions** | `cta.url`, `cta.label`, `calendarUrl` | White card: online → "Register today" (opens outside the app); offline → disabled "Registration needs internet"; **Save reminder** (local opt-in); "Add dates to calendar" when a calendar file is given; "View FAQ" when there is a FAQ. Only rendered when `cta` exists |
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
| `eventSlug` | **Scope.** Set → the landing is listed on that event's home. Absent → the app's Home (phase 2) |
| `path` | Static route of a **built-in** landing (`/womens-renewal`). Synced landings have none and open at `/landing?id=<id>` (phase 2) |
| `status` | `published` (default) or `draft` — drafts never render |
| `pinned`, `publishedAt` | Ordering when several landings are listed (phase 2) |
| `startDate`, `endDate`, `location` | ISO dates; for the generated calendar file and countdowns (phase 2). The visible dates are whatever the `facts` say |

## Where landings appear

- **Event Home (`/event`)** — one `LandingTile` per published landing whose
  `eventSlug` is the event being viewed. Built-in landings are rendered on the
  server inside the `BuiltinOnly` gate, so a synced event never shows Summer
  Solstice promos.
- **Full page** — built-in landings at their `path` (server-rendered, in the
  offline preload list and the navigation warm-up). Synced landings: one shared
  client route `/landing?id=<id>` (phase 2).
- **Reminder banner** — `LandingReminder`
  ([`src/components/landing-reminder.tsx`](../src/components/landing-reminder.tsx)),
  mounted in the root layout: once the attendee tapped **Save reminder** and the
  device is online, a fixed banner offers **Register** and **View details**
  until dismissed. Personal opt-in, so it is **not** gated by the active
  event. Keys are per landing, so several can be saved.
- **App Home (`/`)** — planned for phase 2: landings with no `eventSlug` (or
  `pinned`) as a "Featured" card above News & posts.

## Two sources, one renderer

| | Built-in | Synced (phase 2) |
|---|---|---|
| Content | `src/data/landings.json` + images in `public/images/<landing>/` | `landings[]` in the Home feed (`GET /home`), stored in the `solstice-home-feed` Dexie DB next to `posts` |
| Reaches the device | In the static export | Background refresh (`HomeFeedAgent`), images warmed into the offline cache |
| Offline assets | `landingAssets()` lists a built-in landing's local images and calendar file for the preloader — **no manual `staticAssets` edit** when adding a landing | Absolute Media Library URLs, pre-cached at fetch time like post images |
| Updated by | An app release | Saving in wp-admin; no `content_version` bump involved (the feed is event-independent) |

The scope rule is the one posts already follow: everyone's landings plus the
ones scoped to the event being viewed. Normalizers drop malformed items
silently, like `normalizePost()` — check that a landing shows up, not just that
the screen renders.

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
2. **Phase 2 — synced landings (app).** `landings[]` in
   [`home-feed.ts`](../src/lib/home-feed.ts) (Dexie v2, normalizer,
   `visibleLandings()`), tiles from the store on the Event Home and a
   "Featured" card on the App Home, the shared `/landing?id=` route (client
   page reading the id — check `useSearchParams` under static export in the
   bundled Next docs first), the reminder reading synced landings too, an
   `.ics` generated on the device from `startDate`/`endDate`/`location` when no
   `calendarUrl` is given, and a `landings` array in
   `scripts/fixtures/home.json` so the whole flow is testable against the mock.
3. **Phase 3 — plugin P10.** `ssa_landing`, an *Event App → Landings* screen,
   `landings[]` in `GET /home`, a `landings` import type — see
   [BACKEND-WSOL26.md](BACKEND-WSOL26.md) P10.

Verification for any change here: `npm run typecheck && npm run lint && npm run
build`, then confirm `out/womens-renewal.html` still carries the landing's text
and `out/event.html` the tile, and open the page in a mobile viewport.
