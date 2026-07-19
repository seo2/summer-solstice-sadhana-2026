# Messaging, alerts & notifications

Design for the in-app messaging system: direct messages, group chats, official
announcements, work-group (seva team) channels, and alarms/notifications.

> Status: planning. Decided direction: **polling-first on WordPress, socket-ready API**.
> Nothing here ships before Phase 1 (backend + accounts) exists.

## Decision: polling now, socket-ready design

WordPress/PHP cannot hold WebSocket connections (request→response model), but that does
not force a choice between WordPress and realtime:

- **MVP:** the app polls REST endpoints on the WordPress backend. No extra infrastructure.
- **The API is transport-agnostic.** Clients always sync through the same REST contract
  (cursor-based `GET /messages?since=`); a realtime channel, when added, is only an
  *accelerator* that tells the client "poll now" or pushes the same payload shape.
- **Later:** a small companion service (Node + Socket.io, or Mercure) holds the WebSocket
  connections. WordPress stays the source of truth: it stores each message in MySQL, then
  pings the companion over HTTP, which fans out to connected clients. A hosted
  pub/sub (Ably/Pusher) is an alternative with less ops but a monthly cost and a hard
  internet dependency — which rules it out for the camp local network.
- **Camp edge server tie-in:** the lightweight Node companion is exactly the kind of
  process that can run on the on-site edge server ([LOCAL-NETWORK.md](LOCAL-NETWORK.md)),
  giving camp-LAN realtime without internet. A full WordPress replica would not.

Because polling and sockets share one contract, upgrading to realtime later requires no
client redesign — the socket layer is additive.

## Channel model

One unified model: everything is a **channel** with a type; a DM is just a private
channel with exactly two members.

| Channel type | Who writes | Who reads | Notes |
|---|---|---|---|
| `dm` | Both members | Both members | Created on first message; unique per user pair |
| `group` | Members | Members | User-created group chats |
| `official` | Staff/admin roles only | Everyone at the event | Announcements; read-only for attendees |
| `work_group` | Team members + leads | Team members | Auto-provisioned per seva/work group |
| `alert` | System/staff | Targeted users | Alarms & notifications feed (see below) |

## Data model (extends the BACKEND.md sketch)

```
channel         (id, event_id, type[dm|group|official|work_group|alert],
                 name?, work_group_id?, created_by, created_at)
channel_member  (channel_id, user_id, role[member|moderator|owner],
                 muted, last_read_message_id, joined_at)
message         (id, channel_id, author_id, body, kind[text|system|alert],
                 created_at, edited_at?, deleted_at?)
```

Notes:

- `message.id` is an ordered cursor (auto-increment or ULID) — the sync cursor.
- `last_read_message_id` per member powers unread badges cheaply.
- Soft-delete + edit timestamps so polling clients converge (deletes/edits are rows
  returned by the cursor too, via `updated_since` semantics).
- Official channels: membership is implicit (everyone in the event), enforced by
  capability checks rather than membership rows.

## REST API (WordPress plugin, `wp-json/3ho-solstice/v1/*`)

- `GET  /channels` — channels for the current user, with unread counts.
- `POST /channels` — create group DM/chat (server dedupes DM pairs).
- `GET  /channels/{id}/messages?since={cursor}&limit=N` — history + incremental poll.
- `POST /channels/{id}/messages` — send (server assigns id/timestamp).
- `POST /channels/{id}/read` — advance `last_read_message_id`.
- `GET  /updates?since={cursor}` — **cheap combined poll**: one request returns new
  message counts per channel + new alerts, so the app polls a single endpoint and only
  fetches bodies for channels the user opens.

All routes require auth ([BACKEND.md](BACKEND.md)); capability checks per channel type.

## Polling strategy (client)

- App foreground, messaging screen open: poll `/updates` every ~10–15 s.
- App foreground, elsewhere: every ~60 s.
- Background/native: rely on push, not polling.
- Outbound messages go through the existing **local outbox pattern** (like the contact
  form): queue in Dexie, flush on connectivity, mark pending/sent in the UI. Messaging
  must degrade gracefully offline — reading history always works from the local store.

## Alarms & notifications

Two delivery layers over one content model (`alert` channels):

1. **Push** (APNs/FCM via the backend `device` table, [NATIVE.md](NATIVE.md)) — for
   urgent/official alerts when the device has internet.
2. **In-app feed** — the `alert` channel is fetched by the same sync, so alerts arrive
   even when push is unavailable (web PWA, camp LAN without internet).

Targeting: whole event (official), a work group, or an individual. Locally scheduled
agenda reminders remain a separate, fully offline feature
(`@capacitor/local-notifications`).

## Moderation & safety (scope for launch)

- Staff role can delete any message and mute users per channel.
- Report-message endpoint (flags into wp-admin for review).
- Rate limiting on send per user.

## Phasing

1. **Phase 3a:** `official` announcements + `alert` feed (read-mostly, simplest, highest
   value) + push wiring.
2. **Phase 3b:** `work_group` channels (bounded membership, known groups).
3. **Phase 3c:** DMs and free-form groups (largest moderation surface — last).
4. **Later:** realtime companion (Node/Mercure) in the cloud and/or on the camp edge
   server; reassess when polling load or UX demands it.
