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

### Teacher / presenter info — 📋 Phase 3

- Bios, photos, country, and the sessions each teacher leads (linked to program items).
- Depends on: backend content model (`teacher` table).

### Daily menus + nutrition / yogi diet — 📋 Phase 3

- Per-day meals, nutritional info, and general yogi-diet guidance.
- Content-driven; can seed statically first, then move to backend.
- Depends on: content model (`menu_day`), optional editing workflow.

### Messaging — 📋 Phase 3

- Direct messages and/or announcement channels.
- Realtime when connected (cloud or camp LAN); store-and-forward across gaps.
- Depends on: backend realtime, identity, local-network relay.

### Work-group communication — 📋 Phase 3

- Channels for the seva / work groups an attendee belongs to.
- Membership-scoped; builds on messaging + profile.
- Depends on: `work_group` + `work_group_member` model.

### Multi-event — 📋 Phase 4 (design early)

- Event as a first-class entity; program/map/info/teachers/menus scoped per event.
- Event switcher; follow/register for multiple events.
- Depends on: multi-event data model baked in from Phase 1 ([BACKEND.md](BACKEND.md)).

### Store: merchandising — 💤 Phase 5

- Catalog, cart, checkout for merch.
- Depends on: payments provider (to be chosen), backend `order` model.

### Store: ticket sales — 💤 Phase 5

- Event registration + payment; QR entry tied to existing check-in flow.
- Depends on: payments, identity, event registration.

## Dependency summary

```
auth/profile ──▶ messaging ──▶ work-group channels
     │
     ├──▶ push (device tokens) ──▶ widget / lock-screen "up next"
     │
     └──▶ multi-event scoping ──▶ store (merch + tickets)

local network (edge server) ──▶ underpins updates, notifications & messaging at camp
```
