# Backend

Plan for introducing a backend to what is today a backend-less static PWA.

> Status: proposal / planning. No backend code exists yet beyond the contact endpoint.
> Decisions marked **(decision pending)** should be confirmed before implementation.

## Decision: WordPress + MySQL for the MVP

The backend for the first version is **WordPress** (custom REST endpoints on the existing
3ho.org WordPress site, backed by its **MySQL** database).

Why WordPress for the MVP:

- We already run WordPress for 3ho.org and other projects — hosting, ops, and team
  fluency already exist. Lowest-friction path to shipping.
- The app **already integrates WordPress**: the contact form posts to a custom route
  (`wp-json/3ho-solstice/v1/contact`, see `wordpress/3ho-solstice-contact-endpoint.php`),
  so the REST pattern is proven here.
- WordPress gives **users, roles, and auth** out of the box, a **content admin UI**
  (wp-admin) so non-technical staff can maintain program/teachers/menus, and
  server-side **push** (PHP → APNs/FCM) for free. It runs on MySQL, which is the
  fallback option anyway.

This is a "start pragmatic, keep it swappable" choice, not a permanent commitment. See
the guardrails and limits below, and reassess at the realtime/edge-sync stages.

## Guardrails (so the backend stays swappable)

- The app consumes a **versioned REST bundle** (`updated_since` / ETag), never a call per
  screen. This extends today's offline cache model and keeps the client backend-agnostic.
- Event/program/teacher/menu data lives in **clean custom MySQL tables**, not overloaded
  Custom Post Types, wherever relational queries matter — so the schema stays portable if
  we ever migrate off WordPress.
- All API contracts are defined app-side and could be served by another backend later
  without client changes.

## Known limits of WordPress (plan around them)

- **No realtime / WebSockets.** Messaging and work-group channels (Phase 3) start as
  **polling** against REST, or gain a small companion realtime service later. Fine for
  announcements; revisit for live chat.
- **Edge server at camp.** A full WordPress + MySQL stack can run on a mini-PC, but it is
  heavier to replicate/sync than a purpose-built sync service. Keep this in mind for the
  local-network work ([LOCAL-NETWORK.md](LOCAL-NETWORK.md)); a lightweight relay may be
  better than a full WordPress replica on-site.

## Hard constraint from the current app

The web app builds with `output: "export"` (fully static, no Node server at runtime),
and it is wrapped by Capacitor for native. The backend is therefore a **separate service**
(the WordPress site) exposing a stable HTTPS REST API. The app talks to it as a client.

Everything must keep working **offline and logged out**. The backend adds sync, identity,
and social features on top of the local-first core — it never becomes a hard dependency
for reading the program, map, or info.

## Design goals

1. **Offline-first sync**, not request-per-screen. The device keeps a local copy
   (already IndexedDB/Dexie) and syncs when connectivity allows — including over the camp
   local network ([LOCAL-NETWORK.md](LOCAL-NETWORK.md)).
2. **Multi-event from day one** in the data model, even if the UI ships one event first.
3. **Minimal moving parts** — lean on the WordPress we already operate.
4. **Realtime where it matters** (messaging, work-group channels) — polling first on
   WordPress, dedicated service later if needed.

## Implementation shape on WordPress

- **Custom plugin** (extending the pattern of `3ho-solstice-contact-endpoint.php`) that
  registers REST routes under a namespace such as `wp-json/3ho-solstice/v1/*`.
- **Auth**: WordPress users + a token scheme for the app — JWT (e.g. "JWT Authentication
  for WP REST API") or Application Passwords. Registration/login/reset via REST. **(decision pending)**
- **Data**: custom MySQL tables for `event`, `program_item`, `teacher`, `menu_day`,
  `work_group`, `message`, etc. (see model below). Use CPTs only where wp-admin editing
  is the main benefit and relational needs are light.
- **Push**: PHP sends to APNs/FCM using stored device tokens.
- **Admin**: wp-admin screens (or ACF/custom UI) let staff edit event content.

## Multi-event data model (sketch)

Design the schema so a second event is data, not a migration. Table names are logical;
on WordPress these are custom tables (prefixed) or CPTs where appropriate.

```
event            (id, slug, name, start_date, end_date, location, timezone, status)
user             (WordPress user + profile meta: display_name, photo_url, home_timezone)
event_membership (user_id, event_id, role, registered_at)      -- a user follows/attends N events
program_item     (id, event_id, date, start_time, end_time, title, category, location, description, teacher_id?)
category         (id, event_id, name)
venue            (id, event_id, name, description, map_coords?)
teacher          (id, event_id, name, bio, photo_url, country?)
menu_day         (id, event_id, date, meals[], nutrition_notes)
work_group       (id, event_id, name, description)
work_group_member(user_id, work_group_id, role)
message          (id, event_id, channel_id, author_id, body, created_at)  -- DMs + group channels
device           (id, user_id, platform, push_token, last_seen)
agenda_item      (id, user_id, event_id, program_item_id)      -- server copy of the local agenda
order            (id, user_id, event_id, type[merch|ticket], status, ...)  -- Phase 5
```

Notes:

- Almost everything is scoped by `event_id`. The current single-event JSON
  (`src/data/*.json`) becomes the seed for the first `event` row.
- The existing local Dexie stores map to `agenda_item`, `favorite`, and the contact
  outbox; syncing them up is the first real sync surface.
- Per-user data (agenda, messages, memberships) is protected by WordPress auth +
  capability checks on each REST route.

## API surface (initial)

- **Auth**: register, login, logout, refresh/validate token, password reset.
- **Sync**: pull event bundle (program/categories/venues/info/teachers/menus) with an
  ETag or `updated_since` cursor; push local changes (agenda, outbox, profile).
- **Content**: read-only event content endpoints (also delivered as a cacheable bundle).
- **Messaging / groups**: channels list, message history, send (poll for new).
- **Devices**: register/unregister push token.

## Sync strategy

- Content (program, info, map, teachers, menus): server is the source of truth, delivered
  as a **versioned bundle** the app caches (extends today's offline cache model).
- User data (agenda, favorites, profile, outbound messages): **queue locally, flush on
  connectivity**, last-write-wins per record to start (revisit if conflicts hurt).
- The sync client must accept a **local-network base URL** as an alternative to the cloud
  origin — see [LOCAL-NETWORK.md](LOCAL-NETWORK.md).

## Future alternatives (reassess after MVP)

If realtime messaging or the camp edge-sync outgrow WordPress, options include a managed
platform (**Supabase**: Postgres + Auth + Realtime + Storage + Edge Functions; a
`supabase` helper skill is available in this workspace), **Firebase** (realtime + FCM), or
a **custom Node/Nest + Postgres** service. Because the app talks to a versioned REST
bundle, such a move should not require client rewrites — only re-pointing the base URL and
matching the contract.

## Open decisions

- Auth token scheme on WordPress (JWT plugin vs Application Passwords vs custom).
- Custom tables vs CPTs per entity (relational needs vs wp-admin editing convenience).
- Hosting/scale of the WordPress site under app traffic; caching strategy for the bundle.
- Whether messaging launches polling-only or waits for a realtime companion.
- Payments provider for Phase 5.
