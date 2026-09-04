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
| `venues[]` | `id`, `name` | Program venue filter; Map venue cards **only when no map image** |
| `categories[]` | `id`, `name` | Program category filter and chips |
| `infoPages[]` | `id`, `title` | Info Hub accordions |
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

`infoPages[].content` is plain text, rendered by the Info Hub:

- A blank line starts a new paragraph.
- A line starting with `∙`, `•`, `—` or `-` becomes a styled list item.
- Keep 3HO terminology exact: WTY®, White Tantric Yoga®, Sadhana, Gurdwara.
- No internal labels ("PDF page", "Section N") — this is attendee-facing copy.

## Menus

`menus[].meal` must be one of `breakfast` · `lunch` · `dinner` · `snack`; any
other value is dropped. `items` is an array of dish strings, `notes` carries
dietary information, `title` is an optional name for the meal.

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
dummy Winter Solstice 2026 — 47 sessions across 7 days, 6 teachers, 6 venues,
8 categories, 6 info pages, 19 menu entries, and a generated venue map.

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

The converter also emits `venues`, `categories` and `infoPages` CSVs, but that
screen **cannot import them yet** in either format: they have tables, and their
upserts (`upsert_simple`, `upsert_info_pages`) still live in WP-CLI as private
methods. The files are ready for the day the screen learns those types; until
then load them through the mock backend.

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

Also worth an editorial decision, not a bug: when an event publishes a
`mapImage`, the Map tab shows **only** the map — the per-venue descriptions from
the bundle are the no-map fallback and never appear alongside it.
