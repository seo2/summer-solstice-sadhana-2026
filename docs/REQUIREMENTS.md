# Summer Solstice Sadhana App — Features & Technical Requirements

Scope statement for the new version of the app: the offline-first PWA, now also
**ported to native Android and iOS** (Capacitor). Prepared 2026-08-25 for planning
and stakeholder review. Status legend: ✅ built · 🔧 built, pending ops/QA ·
📋 planned.

## 1. Functional requirements

### 1.1 Event program

- ✅ Full schedule browsing (125+ activities) grouped by day, with detail pages.
- ✅ Text search plus filters: day, venue, category, and advanced filters
  (multi-select categories, time-of-day presets, custom hour range).
- ✅ Activity detail: times, venue, category/tags/language chips, facilitator
  with photo, full description.
- ✅ Program content importable from the checkout/registration platform feed
  (`pull-program`, build-time). 📋 Runtime sync of the same feed.
- ✅ Runtime refresh (2026-08-26): synced event bundles auto-update over the
  internet in the background, with a quiet "Program updated" toast and offline
  pre-caching of bundle photos.

### 1.2 Teachers

- ✅ Teacher directory with photos (initials fallback, duo pairs) and session counts.
- ✅ Teacher profile: bio, country, all sessions (linked to the program).
- ✅ Quick-view teacher card opened from any program item.
- 📋 Complete bios for all teachers (content task, 33 pending).

### 1.3 Favorites & personal agenda

- ✅ One-tap favorites from program, teacher cards and detail views; personal
  agenda view; stored on-device (works with no account and no connectivity).
- ✅ Cross-device favorites sync when signed in (merge on login, safe deletions).
- ✅ Change alerts (2026-08-27): a favorited session that moves (time/venue) or is
  cancelled notifies on the next sync — computed on-device, no account needed.

### 1.4 Accounts

- ✅ Optional accounts — the app is fully usable anonymously.
- ✅ Sign in with existing **3ho.org accounts** (username or email) or create an
  account in-app (same WordPress user pool); password reset via the site.
- ✅ Account UI: header avatar with initials, profile, sync status, sign out.
- ⏸️ **Hidden until further notice (2026-09-04)** — no account-creation path
  exists for attendees, so the sign-in entry points (header button, Event-home
  tile, `/account` form) are switched off via `ACCOUNT_SIGN_IN_ENABLED` in
  `src/lib/features.ts`. Existing sessions keep working.

### 1.5 Multi-event

- ✅ Event as a first-class entity server-side; the app can download any published
  event and render it in the full experience (program, teachers, favorites), with
  a Home switcher between events. Works offline once synced.

### 1.6 Announcements, alerts & messaging

- ✅ Server-side: official Announcements + urgent Alerts channels per event;
  staff publish from wp-admin or REST; polling API with a single cheap
  "what's new" endpoint.
- ✅ App-side feed UI + background polling (2026-08-27): `/announcements` feed
  (offline once fetched) + header bell with locally tracked unread badge.
- 📋 Push delivery of alerts (APNs/FCM) — hook already in place server-side.
- 📋 Later phases: work-group (seva) channels, group chats, direct messages.

### 1.7 Native capabilities (the port)

- ✅ iOS and Android projects building from the same web codebase (Capacitor).
- ✅ Agenda reminders: local notification 15 minutes before each favorited
  session — fully offline, no server needed.
- 🔧 Push notifications: device registration built end-to-end — since 2026-08-27
  anonymous-capable (no account needed) with local notification preferences
  (alerts on by default, future-event news opt-in). Requires APNs key (Apple)
  and Firebase project (Android) to go live.
- 📋 Home-screen widget and lock-screen "up next" (native modules, later phase).
- 📋 App Store / Play Store listings and review submission.

### 1.8 Info & camp life

- ✅ Offline Info Hub (camp guide from the booklet) and zoomable camp map.
- ✅ Per-event info & map (2026-08-27): a synced event shows its own info pages
  and its own zoomable venue map (or a venue list until one is published) —
  never the wrong campground's guide.
- ✅ Contact form with offline outbox (sends when connectivity returns).
- ✅ Daily menus UI (2026-08-27): per-day meals with dietary notes, offline,
  fed by the backend `menu_day` model. 📋 Real menu content + yogi-diet
  guidance texts (content team).

### 1.9 Content administration (staff-facing)

- ✅ wp-admin suite: Events CRUD, Program editor (filterable list), Teachers
  editor with Media Library photos, JSON Import (create/update, dry-run),
  Announcements publisher.
- ✅ The same content renders on 3ho.org via Gutenberg blocks or shortcodes with
  the app's visual design — one source of truth for web + app.

### 1.10 Commerce

- ✅ Decision: link out to the existing ticket-sales website; no in-app payments
  (simplifies store review). 📋 Revisit native commerce only if needed.

## 2. Technical requirements

### 2.1 Client stack

- Next.js 15.5 (App Router, static export) + React 19 + TypeScript + Tailwind 4.
- PWA: Workbox service worker + full-content offline preloader (versioned cache,
  currently v57); IndexedDB (Dexie) for favorites, agenda, contact outbox, synced
  events and auth session.
- **Capacitor 8** wrapping the same build for iOS (Swift Package Manager) and
  Android; app id `org.threeho.summersolstice2026`.
- Design system: in-repo `design/` folder (tokens, program style guide, teachers
  prototype) — single visual source for app and website surfaces.

### 2.2 Backend

- WordPress (3ho.org) + MySQL; custom plugin `3ho-solstice-app` (v0.4.0).
- Clean custom tables (`ssa_*`), multi-event from day one; portable schema
  (swappable backend by design — the app only consumes the REST contract).
- REST API (`3ho-solstice/v1`): auth (opaque bearer tokens, 30-day, hashed at
  rest), versioned content bundle with ETag/`updated_since`, agenda push
  (last-write-wins), device push tokens, channels/messages/updates polling.
- Security: sanitization + prepared statements throughout, per-route rate
  limiting, CORS allowlist (site, app origin, Capacitor origins, localhost dev),
  staff capability checks for publishing.

### 2.3 Offline & connectivity (hard requirement)

- Every core feature must work with **zero connectivity** after first load:
  program, teachers, favorites, reminders, info, map.
- Sync is opportunistic: outbox/retry patterns, incremental cursors, ETag.
- Camp local network (R&D, `docs/LOCAL-NETWORK.md`): tiered plan — on-site
  reverse-proxy cache first (server keeps its own uplink), full WordPress mirror
  with store-and-forward reconciliation as the fully-offline fallback.

### 2.4 Native ops requirements (to go live on stores)

- Apple Developer account: signing identities, APNs key, Push capability;
  App Store Connect listing. Xcode QA on-device.
- Google Play Console account; Firebase project + `google-services.json` (FCM).
- Final 1024 px app icon artwork (current asset is an upscale — replace before
  submission); splash screens generated via `@capacitor/assets`.
- Store review considerations: no in-app payments (link-out commerce), optional
  accounts, notification permission requested in context.

### 2.5 Quality & process

- Validation gate per change: `typecheck` + `lint` + `build` + exported-output
  verification; offline cache version bumped on any visible change.
- Git: branch per change set, changelog discipline (Keep a Changelog), docs
  under `docs/` with a maintained index.
- Terminology preserved exactly: WTY®, White Tantric Yoga®, Sadhana, Gurdwara,
  Ram Das Puri. UI copy in English.

## 3. Delivery status summary

Phase 1 (backend + accounts) ✅ · Phase 2 (native port) 🔧 code complete, ops
pending · Phase 3a (announcements/alerts) server ✅ / app feed ✅ (push 📋) ·
Phase 3b/3c (groups/DMs) 📋 deferred post-WSOL26 · Multi-event ✅ (early, with
runtime refresh) · Commerce link-out ✅ decision · Camp network 📋 R&D.
