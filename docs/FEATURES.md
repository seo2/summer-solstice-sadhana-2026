# Features

Planned features beyond today's offline guide, with status, dependencies, and the
roadmap phase each belongs to. See [ROADMAP.md](ROADMAP.md) for phase ordering.

Status legend: ✅ shipped · 🔜 next · 📋 planned · 💤 deferred

## Shipped today

| Feature | Notes |
|---|---|
| ✅ Program browsing + filters | 125 activities, category filters, detail pages |
| ✅ Favorites + personal agenda | Local only (Dexie/IndexedDB) |
| ✅ Offline Info Hub | Generated from booklet content |
| ✅ Camp map | Zoom/pan, legend |
| ✅ Contact form | Local outbox + optional WordPress endpoint |

## Planned features

### User registration & login — 🔜 Phase 1

- Account creation and sign-in; unlocks sync and social features.
- App stays fully usable **logged out** (core content never requires an account).
- Depends on: [BACKEND.md](BACKEND.md) (auth).

### User profile — 🔜 Phase 1

- Display name, photo, preferences, home time zone.
- Basis for messaging identity and work-group membership.
- Depends on: backend + auth.

### Push notifications — 🔜 Phase 1 / 2

- Announcements and agenda reminders.
- Cloud push via APNs/FCM; **local-network fallback** at camp
  (see [LOCAL-NETWORK.md](LOCAL-NETWORK.md)).
- Depends on: native shell ([NATIVE.md](NATIVE.md)), device token registration.

### Home-screen widget + lock-screen "up next" — 📋 Phase 2

- Shows the next scheduled agenda item without opening the app.
- Requires native code (iOS WidgetKit / Live Activities, Android App Widget / ongoing
  notification). See [NATIVE.md](NATIVE.md).
- Depends on: native shell + a synced agenda snapshot.

### Program advanced filters — ✅ shipped (cache v47)

- Redesign of the Program filter system per the prototype in
  `design/program-style-guide.html` (section 03 "Filter panel"): an expandable
  **Advanced filters** panel below the existing search/day strip/selects, with
  **multi-select category chips**, **time-of-day presets** (Morning / Midday /
  Afternoon / Evening), a **custom hour range** (dual slider), an active-filter
  count badge on the toggle, and Clear/Apply actions.
- Pure client-side change in `src/components/program-explorer.tsx`; no backend
  dependency. Follow `design/PROGRAM-DESIGN-SYSTEM.md` tokens.
- Depends on: nothing (can ship any time; bump offline cache).

### Teacher / presenter info — ✅ step 1 shipped (static) · backend step 📋 Phase 3

- Bios, photos, country, and the sessions each teacher leads (linked to program items,
  accessible from program detail). Spec: [TEACHERS.md](TEACHERS.md).
- Static-first via `teachers.json`; migrates to the backend bundle unchanged.
- Depends on: nothing for step 1; backend content model (`teacher`) for step 2.

### Daily menus + nutrition / yogi diet — 📋 Phase 3

- Per-day meals, nutritional info, and general yogi-diet guidance.
- Content-driven; can seed statically first, then move to backend.
- Depends on: content model (`menu_day`), optional editing workflow.

### Messaging, alerts & notifications — 📋 Phase 3

- Unified channel model: **direct (1:1)**, **group chats**, **official announcements**
  (staff → everyone), **work-group (seva team) channels**, and an **alarms/alerts feed**.
- **Polling-first on WordPress, socket-ready API**; realtime companion (Node/Mercure)
  later — cloud and/or camp edge server. Design: [MESSAGING.md](MESSAGING.md).
- Store-and-forward offline (Dexie outbox); rollout order: official + alerts →
  work-group channels → DMs/groups.
- Depends on: backend + identity (Phase 1); push for alert delivery ([NATIVE.md](NATIVE.md)).

### Multi-event — 📋 Phase 4 (design early)

- Event as a first-class entity; program/map/info/teachers/menus scoped per event.
- Event switcher; follow/register for multiple events.
- Depends on: multi-event data model baked in from Phase 1 ([BACKEND.md](BACKEND.md)).

### Store: merch & tickets — 💤 Phase 5

- **Decision: link-out first** — the app links/embeds the existing ticket-sales website
  (and a web merch store, e.g. WooCommerce); no in-app checkout to start.
- In-app commerce (catalog, cart, payments, `order` model) only if link-out proves
  insufficient; payments provider decided then.

## Dependency summary

```
auth/profile ──▶ messaging ──▶ work-group channels
     │
     ├──▶ push (device tokens) ──▶ widget / lock-screen "up next"
     │
     └──▶ multi-event scoping ──▶ store (merch + tickets)

local network (edge server) ──▶ underpins updates, notifications & messaging at camp
```
