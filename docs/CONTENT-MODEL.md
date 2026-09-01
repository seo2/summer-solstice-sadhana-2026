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
render; deactivating it (the "Summer Solstice" chip in the event switcher)
restores the built-in content. Both live side by side in "Your events" on Home.

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
| `event` | `slug`, `name` | Home hero, event switcher, Map kicker |
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
dummy Winter Solstice 2026 — 49 sessions across 7 days, 6 teachers, 6 venues,
8 categories, 6 info pages, 19 menu entries, and a generated venue map.

```bash
npm run mock-backend      # http://localhost:3999
npm run dev -- -p 3011
```

Then in the app: **`/sync-lab`** → base `http://localhost:3999`, event slug
`wsol26` → **Fetch bundle** → **Use this event in the app**. Home, Program,
Teachers, Info, Menus and Map all switch to the dummy event.

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
