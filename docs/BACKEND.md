# Backend

Plan for introducing a backend to what is today a backend-less static PWA.

> Status: proposal / planning. No backend code exists yet. Decisions marked
> **(decision pending)** should be confirmed before implementation.

## Hard constraint from the current app

The web app builds with `output: "export"` (fully static, no Node server at runtime),
and it is wrapped by Capacitor for native. Therefore the backend **must be a separate
service** with its own hosting and a stable HTTPS API. The app talks to it as a client;
it is not a Next.js server backend embedded in this repo.

Everything must keep working **offline and logged out**. The backend adds sync,
identity, and social features on top of the local-first core — it never becomes a
hard dependency for reading the program, map, or info.

## Design goals

1. **Offline-first sync**, not request-per-screen. The device keeps a local copy
   (already IndexedDB/Dexie) and syncs when connectivity allows — including over the
   camp local network (see [LOCAL-NETWORK.md](LOCAL-NETWORK.md)).
2. **Multi-event from day one** in the data model, even if the UI ships one event first.
3. **Minimal moving parts.** Prefer a managed platform over hand-rolled infra for a
   small team.
4. **Realtime where it matters** (messaging, work-group channels, live program changes).

## Technology options (decision pending)

| Option | Gives us | Trade-offs |
|---|---|---|
| **Supabase** (recommended default) | Postgres + Auth + Realtime + Storage + Edge Functions in one managed platform; RLS for per-user data; good offline-sync story with client libs | Opinionated; self-host possible but heavier |
| Firebase | Auth + Firestore realtime + FCM push + storage; strong mobile SDKs | NoSQL model; vendor lock-in; multi-event modeling less relational |
| Custom Node/Nest + Postgres | Full control | Most infra + auth + realtime to build and operate ourselves |

Recommendation: start on **Supabase** — it covers auth, relational multi-event data,
realtime for messaging, storage for teacher/menu images, and edge functions for push,
which maps cleanly onto Phases 1–3. Reassess before commerce (Phase 5), which may want
a dedicated payments service regardless of this choice. A `supabase` helper skill is
available in this workspace to accelerate schema, auth, and RLS work.

## Multi-event data model (sketch)

Design the schema so a second event is data, not a migration.

```
event            (id, slug, name, start_date, end_date, location, timezone, status)
user             (id, email, display_name, photo_url, home_timezone, created_at)
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
- Per-user data (agenda, messages, memberships) is protected by row-level security /
  auth rules.

## API surface (initial)

- **Auth**: register, login, logout, refresh, password reset.
- **Sync**: pull event bundle (program/categories/venues/info/teachers/menus) with an
  ETag or `updated_since` cursor; push local changes (agenda, outbox, profile).
- **Content**: read-only event content endpoints (also delivered as a cacheable bundle).
- **Messaging / groups**: channels list, message history, send, realtime subscribe.
- **Devices**: register/unregister push token.

## Sync strategy

- Content (program, info, map, teachers, menus): server is the source of truth,
  delivered as a **versioned bundle** the app caches (extends today's offline cache model).
- User data (agenda, favorites, profile, outbound messages): **queue locally, flush on
  connectivity**, last-write-wins per record to start (revisit if conflicts hurt).
- The sync client must accept a **local-network base URL** as an alternative to the
  cloud origin — see [LOCAL-NETWORK.md](LOCAL-NETWORK.md).

## Open decisions

- Platform choice (Supabase vs alternatives).
- Auth method(s): password, magic link, social, phone.
- Hosting/region and cost model.
- Whether content editing gets an admin UI or stays JSON-seeded initially.
- Payments provider for Phase 5.
