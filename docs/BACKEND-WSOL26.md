# Backend (plugin) changes proposed for the WSOL26 stage

**Status: P1–P3 APPROVED & IMPLEMENTED 2026-08-27 · P4 PROPOSED (pending
approval).** P1/P2/P3 are coded in the
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

## P4 — Checkout feed → WordPress pipeline (WS1 · D3) — **PROPOSAL, pending approval**

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

## Rollout

- All three ship as **plugin v0.5.0 / DB v3** (one dbDelta migration, existing
  pattern). Also still pending there: the v0.4.0 QA list in
  [HANDOFF.md](HANDOFF.md) and the production deploy (WS5).
- Order of value: **P1** unblocks the app's notification preferences and the
  push audience model; **P2/P3** unblock WS2 venue map and WS8 menus.
- After approval: implementation lands in the WP repo working tree for the
  owner's QA and commit; the app-side counterparts follow here branch by branch.
