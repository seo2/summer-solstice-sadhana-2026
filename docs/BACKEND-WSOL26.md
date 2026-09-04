# Backend (plugin) changes proposed for the WSOL26 stage

**Status: P1–P4 APPROVED & IMPLEMENTED 2026-08-27.** P1–P4 are coded in the
3ho.org repo **working tree** as plugin **v0.5.0 / DB v3** (`php -l` clean on
all six touched files; details in that repo's `CHANGELOG.md`). Per that repo's
rules the owner QAs and commits. Owner QA list: reload wp-admin (DB v3
auto-migrates), try the Menus screen and the Events map field, `POST /devices`
without an Authorization header, plus the v0.4.0 QA still pending (test
announcement + `GET /updates`). Companion to [WSOL26-PLAN.md](WSOL26-PLAN.md).

Key discovery while reading the plugin: **per-event info pages already exist
server-side** (`ssa_info_page` table, included in the sync bundle as `infoPages`)
— so WS2's app-side rendering can start with no plugin changes. What follows is
what's actually missing.

## P1 — Anonymous device registration + notification preferences (WS3 · N1)

**Today:** `POST/DELETE /devices` require a bearer token and `ssa_device.user_id`
is NOT NULL — so only signed-in users are reachable by push. Future-event news
(N1) would reach almost nobody, and there is no opt-in/opt-out storage.

**Proposed:**

1. **Schema (DB v3)** — `ssa_device` gains:
   - `user_id` → nullable/0 for anonymous devices (token upsert unchanged);
   - `news_opt_in` TINYINT(1) NOT NULL DEFAULT 0 — future-event news (N1),
     **off by default**: it only turns on from the app's explicit toggle
     (store-compliance requirement);
   - `alerts_opt_in` TINYINT(1) NOT NULL DEFAULT 1 — during-event alerts (N3);
   - `event_slug` VARCHAR(191) NULL — the device's last active event (alert
     audience targeting);
   - `app_version` VARCHAR(40) NULL (debugging/support).
2. **Routes** — `POST /devices` becomes public (`__return_true` + the existing
   origin allowlist + a new `devices` rate-limit bucket). Bearer token optional:
   present → associate `user_id`, absent → anonymous. Payload adds
   `prefs { news, alerts }`, `event`, `appVersion`. `DELETE /devices` also
   public, by `push_token` alone (possession of the unguessable token is the
   credential).
3. **Audience model** (consumed by the future APNs/FCM sender on the existing
   `threeho_ssa_broadcast_posted` hook): *alert* posts → devices with
   `alerts_opt_in = 1` and matching `event_slug`; *news* sends → all devices
   with `news_opt_in = 1`.
4. **App side (this repo, after the plugin lands):** PushAgent registers on
   permission grant with or without sign-in; a small notification-preferences
   UI (two toggles) writes back through the same upsert.

## P2 — Venue map per event (WS2)

**Today:** `ssa_event` has no map field; the app's map page hardcodes the Ram
Das Puri image.

**Proposed:** `ssa_event` gains `map_image` VARCHAR(500) NULL (Media Library
URL, picker in the Events admin screen like Teachers photos); the bundle's
`event` object gains `mapImage`. App side: the zoomable viewer uses the active
event's map and falls back to the built-in image.

*(Info pages: no plugin change needed — already in the bundle. Optional
nice-to-have: a dedicated "Info Pages" wp-admin editor; today they load via the
JSON Import screen / seeds.)*

## P3 — Daily menus (WS8 · `menu_day`)

**Today:** no menus anywhere server-side.

**Proposed:**

1. **Schema (DB v3)** — new table `ssa_menu_day`:
   `id` VARCHAR(191) PK · `event_id` · `date` DATE · `meal` VARCHAR(40)
   (breakfast / lunch / dinner / snack) · `title` VARCHAR(255) NULL ·
   `items` LONGTEXT (one dish per line) · `notes` VARCHAR(500) NULL (dietary:
   vegan/GF flags etc.) · `sort` INT · `updated_at` · `deleted`.
2. **Admin** — a "Menus" submenu (pick day → edit meals), plus a `menus` key in
   the JSON Import screen so a whole week can be loaded at once.
3. **Bundle** — new `menus: [{ id, date, meal, title, items, notes }]`; the app
   groups by date and opens on today.
4. **Version bump** — menu (and info-page/event) edits must bump the event's
   `content_version` so the app's UpdateAgent picks them up; verify the
   existing bump mechanics cover the new write paths.

## P4 — Checkout feed → WordPress pipeline (WS1 · D3) — **APPROVED & IMPLEMENTED 2026-08-27**

Implemented as designed below (`includes/class-ssa-feed.php`, `php -l` clean),
riding the same v0.5.0 / DB v3 working tree — one owner QA pass covers
everything. QA steps at the end of this section.

**Goal:** the registration platform (register.3ho.org, plugin `3ho-tickets`)
publishes the Teacher & Musician program at
`GET /wp-json/wsol/v1/presenter/bundle?event={slug}`. Today the app imports it
at **build time** (`scripts/pull-program.mjs`) — a schedule change requires an
app rebuild. This pipeline moves the import **server-side into 3ho.org**, so
feed changes flow to attendees through the normal bundle sync (UpdateAgent),
with zero rebuilds. Pull-based: **no changes needed on the checkout platform.**

1. **New `includes/class-ssa-feed.php`** — fetch + map + upsert.
2. **Config**: `ssa_event.feed_slug` VARCHAR(191) NULL (null = no feed for that
   event) — rides the **same DB v3 migration**, since v0.5.0 is still
   uncommitted; field on the Events screen. Global option
   `threeho_ssa_checkout_base` (default `https://register.3ho.org`) in Settings.
3. **Triggers**: WP-cron hourly over every event with a `feed_slug`
   (interval filterable), plus a **"Sync feed now"** button in wp-admin.
4. **Merge semantics — identical to `pull-program.mjs`** (the feed only owns
   what it created; curated content always wins):
   - *Program*: rows with id `presenter-*` are feed-owned — upsert all feed
     rows, **soft-delete** feed-owned rows that left the feed (so the app's
     favorited-session change alerts correctly report cancellations). Stable
     ids preserve favorites across reschedules.
   - *Teachers*: match by id or facilitator name (case-insensitive against
     `facilitator_names`); fill **empty** fields only (bio, photo, country;
     append the feed name to `facilitator_names` when missing); append unknown
     presenters.
   - *Venues / categories*: append missing ids only.
   - *Photos*: v1 keeps the checkout platform's URLs (the app pre-caches
     remote photos at sync time since WS1); a later opt-in can sideload them
     into the 3ho.org Media Library for 2027 mirror-friendliness.
5. **Change detection**: hash the normalized mapped payload per event
   (`threeho_ssa_feed_hash_{slug}` option) — write + `bump_content_version()`
   **only when something actually changed**, so hourly polling never spams
   version bumps or client refetches. Last-run status (time, result, counts)
   stored and shown in wp-admin.
6. **Failure handling**: fetch/shape errors keep the last content untouched,
   record the status, and retry on the next cron (15 s timeout, response
   validated before any DB write).
7. **App repo impact: none** — content arrives via the bundle.
   `pull-program.mjs` remains a dev/build-time tool for the built-in event;
   `docs/TEACHERS.md` gets a note that the WSOL26 flow is server-side.

Owner QA when implemented: set `feed_slug=wsol26` on the WSOL26 event → "Sync
feed now" → presenter rows appear and `content_version` bumps → re-run → **no**
bump (hash unchanged) → change something in the checkout program → re-run →
bump, and the app picks it up on its next sync.

## P5 — Home feed: events catalog + posts (`GET /home`) — **IMPLEMENTED 2026-09-04** (plugin v0.6.0 / DB v4)

Spec, contract and QA list live in [HOME.md](HOME.md). In short: `ssa_event`
gains `summary`, `cover_image`, `registration_url`; new `ssa_post` table with an
"Event App → Posts" admin screen; new public `GET /home` route (own rate-limit
bucket, weak `ETag`). Independent of `content_version`. Implemented in the WP
working tree per that repo's rules; owner QA and commit pending.

## P6 — Venue map pins (WS2 follow-up · ✅ implemented 2026-09-04, working tree)

**Today:** the app draws tappable pins, quick-access chips and an "All venues"
legend on any event map from the bundle's `venues[]` (app side shipped, cache
v76), but `ssa_venue` only stores `id`, `name`, `description` — so a synced
event renders a bare image until the plugin can carry placements.

**Implemented as plugin v0.7.0 / DB v5** (on top of the uncommitted v0.6.0;
DB v4 had already run in production, so this is its own migration). `ssa_venue`
gains

| Column | Type | Bundle field | Meaning |
|---|---|---|---|
| `map_x`, `map_y` | DECIMAL(5,2) NULL | `mapPoint: {x, y}` | Pin position as **percent** of the map image width/height (0–100), independent of the file's pixel size |
| `pin_color` | VARCHAR(20) NULL | `color` | Pin color (CSS); the app falls back to a palette |
| `pin_number` | SMALLINT NULL | `number` | Legend number; the app fills gaps in order |
| `featured_rank` | SMALLINT NULL | `featured` | Rank in the chip row (1 = first); NULL = not a chip |
| `kind` | VARCHAR(20) NOT NULL DEFAULT 'venue' | `kind` | `venue` or `landmark` (map-only point — restrooms, parking, cabins; hidden from the Program venue filter) |

- **Sync** (`venue_row()` in `class-ssa-sync.php`): emits `mapPoint {x, y}`
  only when both coordinates are set, plus `color`, `number`, `featured`,
  `kind`; the raw column names never reach the bundle.
- **Importer** (`venue_pin_fields()` in `class-ssa-importer.php`): the `venues`
  type accepts the columns `scripts/fixture-to-csv.mjs` writes (`mapX`, `mapY`,
  `color`, `number`, `featured`, `kind`) and the bundle's nested `mapPoint` in
  JSON. Validated in "Validate only" too: half a coordinate, values outside
  0–100 or an unknown `kind` reject the row with a message; bad
  color/number/featured are dropped field by field. Rows are written with
  REPLACE, so re-importing venues from a file without these columns clears
  their pins. Every write bumps `content_version`.
- **Admin**: help text on the Import screen; the CSV template includes the new
  columns. The visual click-to-place picker is **not built** — pins load by
  CSV/JSON for now.
- **Feed (P4)**: verified — the hourly checkout-feed sync only `insert`s
  missing venue ids and never touches existing rows, so placements survive it.

**Verified on local WordPress** (2026-09-04): migration to DB v5 (12 columns),
dry-run validation, real import of `wsol26-venues.csv` (22 rows), and the
bundle carrying `mapPoint` for 22 venues with 16 landmarks and zero raw column
names. **Pending**: owner commit + production deploy (repo rule), then
re-import the CSV in production — the import done on 2026-09-04 landed before
P6, so production holds 22 flat venues (bundle v15, no pins, landmarks showing
in the Program venue filter) until it is repeated.

## P7 — Info page groups (WS2 follow-up · proposed 2026-09-04)

**Today:** the built-in Info Hub groups its pages under ten topics with icon,
accent color and description, a topic grid with anchors, and section cards
(headings, bullet and numbered lists, definitions, quotes). Synced pages render
as a flat list of accordions with paragraphs and bullets only, because
`ssa_info_page` has no grouping, order or section markup conventions.

**Proposed (same migration as P6):** `ssa_info_page` gains `group_key`
VARCHAR(64) NULL, `sort` INT NOT NULL DEFAULT 0 and `featured` TINYINT(1) NOT
NULL DEFAULT 0; the bundle emits `group`, `sort`, `featured`. The group catalog
(key → icon, accent, description) lives in the app because icons are
components: `start-here`, `health-safety`, `camp-life`, `rules`,
`daily-rhythm`, `yoga-dharma`, `wty`, `practice`, `families`, `faq`,
`nutrition`; unknown or empty keys fall into a "More" group. The Info Pages
editor and importer gain the group dropdown, `sort` and `featured`.

App side (pending, this repo): one shared Info Hub renderer for built-in and
synced pages, plus explicit authoring conventions for synced content —
`## Heading` opens a section card, `1.` numbered lists, `Label: value`
definitions, `>` quotes, `*` footnotes — so wp-admin texts get the same
treatment as the booklet without the booklet's heuristic heading list.

## Rollout

- All three ship as **plugin v0.5.0 / DB v3** (one dbDelta migration, existing
  pattern). Also still pending there: the v0.4.0 QA list in
  [HANDOFF.md](HANDOFF.md) and the production deploy (WS5).
- Order of value: **P1** unblocks the app's notification preferences and the
  push audience model; **P2/P3** unblock WS2 venue map and WS8 menus.
- After approval: implementation lands in the WP repo working tree for the
  owner's QA and commit; the app-side counterparts follow here branch by branch.
- **P6** implemented 2026-09-04 as v0.7.0 / DB v5 in the working tree (app side
  already live behind the bundle fields, cache v76); **P7** stays proposed and
  rides the following migration, its app side follows once the fields exist.
