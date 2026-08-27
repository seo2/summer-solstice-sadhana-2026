# Backend (plugin) changes proposed for the WSOL26 stage

**Status: APPROVED & IMPLEMENTED 2026-08-27** — P1/P2/P3 are coded in the
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

## Rollout

- All three ship as **plugin v0.5.0 / DB v3** (one dbDelta migration, existing
  pattern). Also still pending there: the v0.4.0 QA list in
  [HANDOFF.md](HANDOFF.md) and the production deploy (WS5).
- Order of value: **P1** unblocks the app's notification preferences and the
  push audience model; **P2/P3** unblock WS2 venue map and WS8 menus.
- After approval: implementation lands in the WP repo working tree for the
  owner's QA and commit; the app-side counterparts follow here branch by branch.
