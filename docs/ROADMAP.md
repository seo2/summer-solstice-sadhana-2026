# Roadmap

Planned evolution of the Summer Solstice Sadhana app: from today's offline-first
PWA to a backend-connected, multi-event native app that stays useful on a camp
with poor connectivity.

This is a living plan. Phases are ordered by the priorities stated by the product
owner, but scope inside a phase can shift. Nothing here changes the core principle:
**offline is the product** — every feature must degrade gracefully with no signal.

## Current state (Phase 0 — shipped)

- Offline-first PWA, static export (`output: "export"`) + service worker.
- Program browsing (125 activities), category filters, detail pages.
- Favorites + personal agenda, stored locally in IndexedDB (Dexie).
- Offline Info Hub, zoomable camp map.
- Contact form with local outbox + optional WordPress endpoint.
- Capacitor installed but no native platforms added yet.
- No backend, no login, no accounts.

## Phase 1 — Backend + accounts foundation

Goal: introduce a backend without breaking the offline experience, and stand up
identity so later social features have something to attach to.

- **Backend service on WordPress + MySQL** for the MVP — custom REST endpoints on the
  existing 3ho.org WordPress, kept swappable via a versioned REST bundle. Rationale and
  limits in [BACKEND.md](BACKEND.md).
- **User registration & login** (email + password / magic link to start).
- **User profile** (name, photo, preferences, home time zone).
- **Push notifications** groundwork (device token registration; see [NATIVE.md](NATIVE.md)).
- Keep the app fully usable **logged out and offline**; login unlocks sync, not core content.

## Phase 2 — Native apps (iOS + Android)

Goal: ship real App Store / Play Store apps from the existing web build via Capacitor.

- Add iOS and Android platforms (`npx cap add ios/android`).
- Native push notifications, local notifications wired to the agenda.
- **Home-screen widget** + **lock-screen "up next" indicator** for the next agenda item.
- Store listings, icons, privacy manifests, review submission.
- Details in [NATIVE.md](NATIVE.md).

## Phase 3 — Community & event content features

Goal: turn the guide into a companion that connects people and daily life at camp.

- **Teacher / presenter info** (bios, photos, sessions they lead) — accessible from the
  program; can start static before the backend. Spec in [TEACHERS.md](TEACHERS.md).
- **Daily menus + nutrition** info and general **yogi diet** guidance (second instance).
- **Messaging** — direct (1:1), group chats, **official announcements**, **work-group
  (seva team) channels**, and an **alarms/notifications** feed. Polling-first on
  WordPress, socket-ready API; realtime companion later. Design in
  [MESSAGING.md](MESSAGING.md).
- Per-feature scope in [FEATURES.md](FEATURES.md).

## Phase 4 — Multi-event

Goal: the app serves more than one event over time (future solstices, other 3HO gatherings).

- Event as a first-class entity; content, program, map, and info scoped per event.
- Event switcher; the user can follow / register for multiple events.
- Data model designed for this from Phase 1 to avoid a painful migration
  (see the multi-event data model in [BACKEND.md](BACKEND.md)).

## Phase 5 — Commerce (second instance)

Goal: merchandise and event tickets. Explicitly a later stage.

- **Decision (2026-07): start by linking out** — the app links/embeds the existing
  ticket-sales website rather than building in-app checkout. Zero payment infrastructure
  in the app and the simplest path through App Store / Play Store review.
- **Merchandising store**: same link-out approach first (e.g. WooCommerce on 3ho.org);
  native in-app commerce only if/when the link-out flow proves insufficient.
- Payment provider, tax, and fulfilment decisions deferred until in-app commerce is
  actually pursued.

## Cross-cutting track — Campsite local network (high priority R&D)

Connectivity at Ram Das Puri is poor. In parallel with the phases above, develop an
on-site **local network + edge server** so the app can receive updates, notifications,
and messages over camp Wi-Fi even with no internet — the model seen on cruise ships
and airplanes. Full design in [LOCAL-NETWORK.md](LOCAL-NETWORK.md).

This track informs backend and sync design from the start, so it is not left to the end.

## Sequencing summary

| Order | Track | Status |
|---|---|---|
| Now | Backend + accounts (Phase 1) | Next up |
| Then | Native iOS/Android (Phase 2) | Planned |
| Then | Community & content features (Phase 3) | Planned |
| Eventually | Multi-event (Phase 4) | Planned (design early) |
| Later | Commerce (Phase 5) | Deferred |
| In parallel | Campsite local network | High-priority R&D |
