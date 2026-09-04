# Content model — how event information gets into the app

Where every screen's content comes from, what shape it must have, and how to
load a full dummy event locally.

## Two sources, one renderer

The app renders exactly one event at a time, from one of two sources:

| | **Built-in event** | **Synced event** |
|---|---|---|
| Content | JSON committed in `src/data/` | Bundle fetched from the WordPress `3ho-solstice-app` plugin |
| Event | Summer Solstice Sadhana 2026 | Any event published in the backend (WSOL26 and after) |
| Reaches the device | In the app binary / static export | Over the network, then stored in IndexedDB |
| Updated by | A new app release | A sync refresh, no release needed |

The built-in event is the fallback and is **always** available offline. Activating
a synced event swaps what Program, Favorites, Teachers, Info, Menus and Map
render; opening the built-in Summer Solstice again from Home restores the
built-in content. Every event — built-in, downloaded, or merely
published — is listed on the app's Home (`/`); opening one lands on its Event
Home (`/event`). See [HOME.md](HOME.md).

```
WordPress plugin              app                          screens
─────────────────             ───                          ───────
GET /wp-json/3ho-solstice     event-sync.ts   ──saves──▶   IndexedDB
  /v1/sync?event=<slug>            │                    (solstice-event-store)
        │                          │                             │
        └── SyncedBundle ──────────┘                    bundleActivities()
                                                        bundleTeachers()
                                                        bundleVenues()      ──▶ Program
                                                        bundleCategories()  ──▶ Teachers
                                                        bundleInfoPages()   ──▶ Info Hub
                                                        bundleMenus()       ──▶ Menus
                                                        bundleMapImage()    ──▶ Map

src/data/*.json ──── passed as props from the static pages ─────▶ same screens
```

Source of truth for the shapes: `SyncedBundle` and the `bundle*()` normalizers in
[`src/lib/event-store.ts`](../src/lib/event-store.ts). Every normalizer **drops
items silently** when a required field is missing, so a typo in the backend means
a session that simply never appears — check counts, not just that the screen renders.

## Bundle → screen map

| Bundle key | Required per item | Surfaces in |
|---|---|---|
| `event` | `slug`, `name` | Event Home hero, Home events list, Map kicker |
| `event.mapImage` | — | Map tab (zoomable viewer) |
| `program[]` | `id`, `date`, `startTime`, `title` | Program, Favorites, reminders, Teachers' session lists |
| `teachers[]` | `id`, `name` | Teachers tab, session detail sheets |
| `venues[]` | `id`, `name` | Program venue filter (not `kind: landmark`); Map pins for items with `mapPoint`; Map venue cards **only when no map image** |
| `categories[]` | `id`, `name` | Program category filter and chips |
| `infoPages[]` | `id`, `title` | Info Hub — grouped topic grid, page cards and section cards (same renderer as the booklet) |
| `menus[]` | `id`, `date`, `meal` | Menus tab |

## The three joins — match on NAME, not id

This is the easiest thing to get wrong, and it fails silently.

- `program[].category` must equal a **`categories[].name`** (not the id). The
  filter compares `activity.category === category.name`.
- `program[].location` must equal a **`venues[].name`**. Same reason.
- `program[].facilitator` must appear in some **`teachers[].facilitatorNames`**.
  That array is how one teacher claims several spellings of their name
  ("Dr. Siri Atma Kaur" and "Siri Atma Kaur"); it defaults to `[name]`.

A mismatch does not error — the session renders without a category chip, the
filter returns nothing, and the teacher shows 0 sessions.

Two categories are treated as routine and render without a chip:
**`Meal`** and **`Logistics`** (`ROUTINE_CATEGORIES`).

## Info page content

Synced pages render through the same Info Hub as the booklet
(`src/components/info-hub.tsx` over `src/lib/info-content.ts`): a topic grid,
group headers, one collapsible card per page and section cards inside.

**Grouping.** Each page lands in a topic from the catalog in
`src/lib/info-content.ts` — `start-here`, `health-safety`, `camp-life`,
`rules`, `daily-rhythm`, `nutrition`, `yoga-dharma`, `wty`, `practice`,
`families`, `faq`. The page's own `group` key wins when the bundle carries one
(plugin P7, optional); otherwise a page whose `id` matches a booklet page id
inherits that page's topic; anything else goes under **More**. Optional `sort`
orders pages inside a topic (lower first) and `featured: true` highlights the
card. WSOL26 in production reuses the booklet's 34 ids, so it is fully grouped
today without any of these fields.

**Content.** `infoPages[].content` is plain text with light conventions:

- `## Heading` opens a section card (the booklet's known headings work too).
- A blank line (or a lone `¶`) starts a new paragraph.
- `∙`, `•`, `—` or `-` start a bullet; `1.`, `2.` … a numbered item.
- `Label: value` with a known label (Posture, Mantra, Meaning of the Mantra,
  Breath, Mudra, Eye Focus, Time, End, Comments, Directions) renders as a
  definition; `> text` renders as a quote (consecutive lines join); `*` or
  `**` open a footnote.
- Keep 3HO terminology exact: WTY®, White Tantric Yoga®, Sadhana, Gurdwara.
- No internal labels ("PDF page", "Section N") — this is attendee-facing copy.

The fixture page `page-arrival-lake-wales` in `scripts/fixtures/wsol26.json`
is a worked example of all of the above.

## Menus

`menus[].meal` must be one of `breakfast` · `lunch` · `dinner` · `snack`; any
other value is dropped. `items` is an array of dish strings, `notes` carries
dietary information, `title` is an optional name for the meal.

## Venue map pins

Any `venues[]` item that carries a `mapPoint` is drawn on the event's map as a
tappable pin, listed in the "All venues" legend, and — when `featured` — shown
as a quick-access chip that centers the map on it.

| Field | Type | Meaning |
|---|---|---|
| `mapPoint` | `{ x, y }`, each 0–100 | Position as a **percentage of the map image width/height**, so it does not depend on the file's pixel size |
| `color` | CSS color | Pin color; a palette color is used when missing |
| `number` | positive integer | Number printed in the pin; gaps are filled in order when missing |
| `featured` | integer rank (1 = first) or `true` | Puts the venue in the chip row above the map, in rank order |
| `kind` | `venue` (default) or `landmark` | A `landmark` is a map-only point (restrooms, parking, cabins): it never appears in the Program venue filter and is left out of the no-map venue list |
| `description` | text | Shown in the pin tooltip and the legend |

Malformed map fields are dropped one by one; the venue itself always survives.
Plugin v0.7.0 (P6 in [BACKEND-WSOL26.md](BACKEND-WSOL26.md)) stores them on
`ssa_venue` and accepts them in the venues import: CSV columns `mapX`, `mapY`,
`color`, `number`, `featured`, `kind`, or the nested `mapPoint` in JSON.

## Update semantics

The bundle is versioned. `GET /sync?event=<slug>&since=<n>` answers
`{ unchanged: true }` when `since >= version`, so refreshes are cheap. The
UpdateAgent polls in the background; when a **favorited** session changes time,
venue or disappears, the device diffs old against new bundle and raises a change
alert locally — no account and no server-side targeting involved.

So: **bump `version` whenever content changes**, or clients will never see it.

## Loading a dummy event locally

`scripts/mock-backend.mjs` serves any fixture in `scripts/fixtures/<slug>.json`
as a real sync bundle. [`wsol26.json`](../scripts/fixtures/wsol26.json) is a full
dummy Winter Solstice 2026 — 47 sessions across 7 days, 6 teachers, 22 map
points (6 venues + 16 landmarks) placed on the real Winter Solstice map artwork
(`references/winter-solstice-map-revised-v3.jpg`, served by the mock as
`/photos/wsol26-map.jpg`), 14 categories, 34 info pages and 19 menu entries.

Its **event metadata and White Tantric Yoga days are real**, mirrored from the
registration system (`register.3ho.org/wp-json/wsol/v1/presenter/bundle?event=wsol26`
and the `3ho-solstice-checkout` seed): "Winter Solstice Sadhana Celebration
2026", Dec 15–21 2026, Retreats By The Lake, 2819 Tiger Lake Road, Lake Wales,
FL 33898, with WTY on Dec 17–19 and the Solstice itself on Dec 20. Sessions,
teachers, info pages and menus are invented.

```bash
npm run mock-backend      # http://localhost:3999
npm run dev -- -p 3011
```

Then in the app: **`/sync-lab`** → base `http://localhost:3999`, event slug
`wsol26` → **Fetch bundle** → **Use this event in the app** (or simply open it
from Home's **Events** list). The Event Home, Program, Teachers, Info, Menus
and Map all switch to the dummy event.

The fixture is re-read from disk on **every** request, so the editing loop is:

1. Edit `scripts/fixtures/wsol26.json`.
2. Bump its `version`.
3. Re-fetch in `/sync-lab` (or let the UpdateAgent pick it up) — the app treats
   it as an update, including change alerts on favorited sessions.

No server restart, no rebuild. A broken JSON edit is logged by the mock backend
instead of failing silently.

`mocktest` remains a separate, deliberately tiny event with hardcoded v1→v2
behaviour for exercising the change-alert path — see
[TESTING-LOCAL.md](TESTING-LOCAL.md) Level B.

## How an event reaches a device

Refreshing and *acquiring* are different problems. `event-sync.ts` only ever
updates events already in the store, and the only other writer is Sync Lab — an
internal screen the native shell cannot reach. So a new event needs adoption:

```
app start / back online
   → GET /wp-json/3ho-solstice/v1/events/current
   → not the built-in slug, and no manual choice on record?
   → GET /sync?event=<slug>   →  saveBundle()  →  setActiveEvent(slug, "auto")
```

`src/lib/event-discovery.ts` (`adoptCurrentEvent`) run by `EventAdoptionAgent`.
Three rules keep it safe:

- **A manual choice wins.** Opening an event from Home records the source as
  `"manual"` and adoption stops touching the selection from then on.
- **The built-in slug is skipped** — the bundled content already covers it.
- **Silent on failure.** Offline is normal; the built-in event still works.

**Which event is "current"** is the backend's decision, and the rule is by date,
not by creation order:

1. an event **in progress** (`start ≤ today ≤ end`);
2. otherwise the **next to start**, soonest first;
3. otherwise the **most recently finished**.

`scripts/mock-backend.mjs` implements exactly this across all fixtures, so the
whole flow is testable locally before the plugin endpoint exists.

## Loading a fixture into WordPress by CSV

The plugin's Import screen (*Event App → Import*) takes JSON or CSV for
**program**, **teachers** and **menus**. `scripts/fixture-to-csv.mjs` converts any
fixture into the three CSVs that screen expects:

```bash
npm run fixtures:csv -- wsol26
```

writes `scripts/fixtures/csv/wsol26-{program,teachers,menus}.csv`. The header row
uses the same field names as the bundle, so the CSV and JSON contracts are one
contract; cells holding several values (`tags`, `photos`, `facilitatorNames`,
`items`) separate them with **`|`**.

Import with **Validate only** ticked first: the plugin reports each rejected row
and why, without writing. The usual offender is a spreadsheet reformatting
`09:00` into `9:00` or a date into `12/16/2026`.

The column lists in `fixture-to-csv.mjs` mirror `THREEHO_SSA_Importer::csv_columns()`
in the plugin — change one and change the other.

The converter also emits `venues`, `categories` and `infoPages` CSVs; the
Import screen accepts those types too (plugin ≥ 0.5.x). The venues CSV carries
the map-pin columns (`mapX`, `mapY`, `color`, `number`, `featured`, `kind`)
that plugin v0.7.0 (P6) imports — older plugins silently keep only id, name and
description.

## The Home feed (not part of the bundle)

The app's Home (`/`) reads a second, event-independent payload: `GET /home` —
the **events catalog** (every published event with `summary`, `cover`,
`registrationUrl`) and **posts** (staff news and notices, optionally scoped to
one event). Stored in its own Dexie DB (`solstice-home-feed`) and replaced
whole on every refresh. `scripts/fixtures/home.json` is the mock's source;
the plugin side is proposed as P5. Full contract in [HOME.md](HOME.md).

## Known gaps (2026-09-01)

Found while loading the WSOL26 dummy bundle; both are static strings built from
the **built-in** event that do not follow the active synced event:

- `/program` shows the built-in date range ("Fri, Jun 19 – Sat, Jun 27") under
  the "Program" heading even when a December event is active
  ([program/page.tsx](../src/app/program/page.tsx)).
- `/teachers` sets the document title to "Teachers · Summer Solstice Sadhana
  2026" regardless of the active event ([teachers/page.tsx](../src/app/teachers/page.tsx)).

With a published `mapImage`, venue descriptions appear in the pin tooltips
and the legend — but only for venues that carry a `mapPoint`; a venue without
placement is invisible on the Map tab until the no-map fallback list kicks in.
