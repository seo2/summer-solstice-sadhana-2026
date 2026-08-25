# WSOL26 Plan — Winter Solstice 2026 (Florida)

Feature and task list for the next stage: shipping the app for
**Winter Solstice Sadhana Celebration 2026 (WSOL26) — December 15–21, 2026,
Retreats By The Lake, Lake Wales, Florida** (dates confirmed from the checkout feed;
tickets on sale at register.3ho.org). Distribution: native iOS/Android **plus the web
version (PWA)**, all from the same codebase. Prepared 2026-08-25, decisions resolved
same day. Companion to [REQUIREMENTS.md](REQUIREMENTS.md) (what exists today) and
[HANDOFF.md](HANDOFF.md) (state of both repos). Trello-ready card export:
[WSOL26-TRELLO.md](WSOL26-TRELLO.md).

## Context & assumptions

- **The WSOL26 venue (Florida) has internet.** All content sync for this stage happens
  over the internet against the WordPress backend on 3ho.org. The **camp local network /
  edge server is explicitly out of scope** — it targets the Summer Solstice site at
  Ram Das Puri (New Mexico), which has no connectivity, for **summer 2027**
  (see [LOCAL-NETWORK.md](LOCAL-NETWORK.md)).
- **Offline-first still applies.** Attendees may have no data plan or poor coverage on
  site; everything must keep working with zero connectivity once synced.
- Backend: `3ho-solstice-app` plugin v0.4.0 (auth, sync bundle, devices, and
  announcements/alerts server-side already live in dev; uncommitted in the 3ho.org repo).
- The app's multi-event machinery (event store, synced-event views, Home switcher)
  already works; WSOL26 content is already flowing through the checkout platform
  (`pull-program` defaults to `event=wsol26`).

## Decisions (all resolved 2026-08-25)

| # | Decision | Resolution |
|---|---|---|
| D1 | How WSOL26 ships in the app | ✅ **Same app** via the multi-event machinery. The **web version (PWA) continues** alongside the native apps — same static export, deployed to the web as today. |
| D2 | App name / branding | ✅ Shell renamed to **"3HO Event App"** (implemented 2026-08-25, cache v58: PWA manifest, document title, global header, install page, Capacitor `appName`, iOS `CFBundleDisplayName`, Android `app_name`). In-app content branding stays per-event. |
| D3 | Content source of truth | ✅ **Everything through WordPress** — the checkout feed imports into WP; the app syncs only the WP bundle. Constraint: the sync design must be **mirror-ready** for the summer-2027 local network (see WS1). |
| D4 | WSOL26 dates + venue | ✅ **December 15–21, 2026 · Retreats By The Lake, Lake Wales, FL** (from the live checkout feed; tickets on sale). Content owners per WS7. |
| D5 | App id before first store publication | ✅ Changed to **`org.threeho.eventapp`** (implemented 2026-08-25: Capacitor `appId`, Android `namespace`/`applicationId`/package/`custom_url_scheme`, iOS `PRODUCT_BUNDLE_IDENTIFIER`). Done before anything reached the stores — the id is immutable on Google Play once published. Apple/Google store records must be created with this id (WS4). |

## Workstreams

Each task carries what it is, why it matters, and what "done" looks like.

### WS1 — Runtime content sync (P0 · app)

The piece that makes internet updates real. Today fresh content only reaches users
baked into an app build or through the internal Sync Lab — neither works for a live
event where the schedule changes daily.

- [ ] **UpdateAgent (automatic background refresh)** — A client agent that checks the
      WordPress backend for a newer version of the active event's content bundle
      (program, teachers, venues, categories) on app start and periodically while the
      app is open. It reuses the versioned-bundle contract the server already exposes
      (ETag / `updated_since`), downloads only when something actually changed, and
      writes into the local event store — so the next fully-offline session already has
      the fresh content. Done when a schedule change published in wp-admin appears on
      an attendee's phone within minutes, with zero user action.
- [ ] **Update UX** — What the attendee experiences when content changes: a quiet
      "Program updated" indicator instead of a disruptive reload, silent apply in the
      background, and never any blocking of offline reading. Includes choosing the
      refresh cadence and keeping battery/data use negligible. Done when updates feel
      invisible but trustworthy.
- [ ] **Checkout feed → WordPress pipeline (per D3)** — Automate importing the
      published Teacher & Musician program from the registration platform into
      WordPress. Today `pull-program` bakes that feed into the app's static files at
      build time; moving the import server-side makes WordPress the single source of
      truth, so program changes reach the app through normal sync with **no app
      rebuilds**. Done when a program change in the checkout platform lands in the WP
      bundle without touching the app repo.
- [ ] **Offline photos for synced events** — Teacher photos in synced bundles are
      remote URLs, and the offline preloader currently only saves same-origin
      `/images/…`. Cache these photos on the device at sync time so teacher profiles
      aren't blank rectangles when the attendee is offline. Done when airplane-mode
      browsing shows every photo of the active synced event.

**Mirror-ready design constraints** (so the summer-2027 local network slots in
without client changes — per D3 and [LOCAL-NETWORK.md](LOCAL-NETWORK.md)):

- All sync goes through **one configurable backend origin** (already exists via the
  shared base-URL override) — the camp mirror will serve the **same REST contract**.
- **Relocatable media URLs** in bundles: photos must not be baked in as absolute
  `3ho.org` URLs (they'd break on the camp network) — serve relative paths resolved
  against the active origin, or cache media locally at sync time.
- Bundle **version counters stay monotonic per event** and reconciliation follows the
  store-and-forward model, so a mirror can serve stale-but-consistent content and
  catch up later.
- Later (2027, not now): local-server discovery and automatic failover
  local ↔ internet.

### WS2 — Per-event Info Hub & venue map (P0 · app + backend + content)

**Known gap**: synced events get program, teachers, and favorites — but the Info Hub,
camp map, and Women's Renewal pages are static Summer Solstice content. A WSOL26
attendee opening "Info" today would read about Ram Das Puri.

- [ ] **Info pages per event in the sync bundle** — Backend: a per-event info-pages
      content type included in the bundle; app: render synced info pages with the same
      section-card UI as today's Info Hub, stored offline. Done when a WSOL26 attendee
      can read arrival, schedule basics, and camp-life guidance for **Florida** with no
      signal.
- [ ] **Florida venue map** — Obtain or produce the venue map image for Retreats By
      The Lake, serve it per event through the bundle, and point the existing zoomable
      viewer (zoom buttons + pinch, 50–300%) at the active event's map. Done when the
      Map tab shows the Florida grounds while WSOL26 is active — offline.
- [ ] **Behavior of SSOL-specific sections** — Decide and implement what
      Summer-Solstice-only surfaces (e.g. Women's Renewal) do while WSOL26 is active:
      hidden, replaced by a WSOL equivalent, or clearly labeled as belonging to the
      other event. Done when nothing on screen misleads a WSOL26 attendee.

### WS3 — Announcements & alerts in the app (P0 · app; server is live)

The server side already works: staff publish official Announcements and urgent Alerts
from wp-admin, and a cheap polling API exposes them. The app just can't show them yet.
Design is complete in [MESSAGING.md](MESSAGING.md).

- [ ] **Feed UI** — A screen listing the active event's official Announcements and
      urgent Alerts, newest first, readable offline once fetched. Done when a staff
      post in wp-admin is readable in the app.
- [ ] **Polling agent + unread badge** — Background poll of the single "what's new"
      endpoint (`GET /updates`) on app start and periodically while open; an unread
      count on the navigation so people notice new posts. Done when new posts surface
      within the polling interval without opening the feed.
- [ ] **Notification permission in context** — Ask for notification permission the
      first time it's actually useful (e.g. first alert interaction), never as a
      popup at first launch. Better acceptance rates, and it's what store reviewers
      expect to see.
- [ ] **Push delivery server-side (P1)** — Implement real APNs/FCM sending on the
      existing `threeho_ssa_broadcast_posted` hook so urgent alerts reach phones with
      the app closed. P1 because with Florida connectivity, foreground polling may
      already cover the need for v1. Done when a test alert wakes a locked test
      device.

### WS4 — Store readiness (P0 · ops — longest lead times, start now)

None of this depends on app code, and every item has external waiting time (Apple
review, account approvals). The new app id `org.threeho.eventapp` (D5) must be used
for every record created here.

- [ ] **Apple chain** — Signing identities, **APNs key**, Push Notifications
      capability on the new bundle id, App Store Connect app record, and a TestFlight
      group for internal testers. Done when a signed build installs via TestFlight.
- [ ] **Google chain** — Play Console app record, **Firebase project** for FCM, and
      `google-services.json` added to the Android project so push registration works.
      Done when an internal-track build installs from Play.
- [ ] **Icon & splash artwork** — Replace the current icon (an upscale, not
      submission-quality) with real **1024 px** artwork and regenerate all icon/splash
      sizes with `@capacitor/assets`. Done when store listings and devices show crisp
      art.
- [ ] **On-device QA** — Physical iPhone + Android passes: install, cold start in
      airplane mode, agenda reminders firing 15 min before a favorited session, push
      registration after sign-in, favorites sync. Done when the checklist passes on
      both platforms.
- [ ] **Privacy & review compliance** — Public privacy policy URL, App Store privacy
      labels and Play data-safety form (accounts optional, favorites sync, push
      tokens), review notes explaining link-out ticket sales (no in-app purchases).
      Done when both store forms are submitted without red flags.
- [ ] **Submission with buffer** — First submissions early November so both apps are
      **live by November 24** (3 weeks pre-event) and attendees install before
      traveling. Done when both apps are downloadable publicly.

### WS5 — Backend QA & production deploy (P0 · backend + ops)

The plugin (v0.4.0) has auth, sync, devices, and messaging endpoints working in dev
but has never been production-hardened or deployed, and the WSOL26 event doesn't
exist in the production database yet.

- [ ] **Pending plugin QA** — Lint the new classes (`php -l`), verify the DB v2
      auto-migration on a fresh wp-admin load, post a test announcement, and confirm
      `GET /updates` returns it. Done when the HANDOFF QA list is green.
- [ ] **Commit & deploy the plugin** — Commit v0.4.0 in the 3ho.org repo (repo owner
      does this, per that repo's rules) and deploy to production 3ho.org. Done when
      production answers the REST routes.
- [ ] **Production hardening** — CORS allowlist covering the production web origin
      and Capacitor origins, rate-limit sanity check, token-expiry behavior. Done
      when only intended origins pass and abuse is throttled.
- [ ] **Create & publish the WSOL26 event** — Create the event in wp-admin (Events
      CRUD) with the confirmed dates/venue and publish it; seed program/teachers as
      content lands (WS7). Done when the app can sync the WSOL26 bundle from
      production.

### WS6 — Favorites sync for synced events (P1 · app)

Today only the built-in event's favorites sync across devices — the v1 local store
didn't record which event a favorite belongs to. Favorites, agenda, and reminders
already **work locally** for synced events; this is only about the cross-device copy.

- [ ] **Event-scoped favorites sync** — Extend the sync client to push/pull favorites
      per event (the server contract already carries an `event` field), including
      merge-on-login and tombstoned deletions for synced events. Done when a WSOL26
      favorite marked on one phone appears on the same account's other phone.

### WS7 — Content (P0 · content team, parallel)

The app can only be as good as what's loaded into it — and today the WSOL26 feed is
live but **empty**.

- [ ] **WSOL26 program & teachers** — Finalize the Teacher & Musician program in the
      checkout platform / WordPress. The feed responds but its presenter program is
      still **empty (0 items)** as of 2026-08-25. Done when the bundle carries the
      real schedule.
- [ ] **Teacher bios** — 33 of 34 bios are still empty (applies to both events). The
      profile "About" section appears automatically as soon as a bio exists. Done
      when priority teachers have bios.
- [ ] **WSOL26 info texts & map artwork** — Arrival/camp-life texts for the Florida
      venue and the venue map image (feeds WS2). Done when WS2 has real content to
      render.
- [ ] **On-device content QA** — Full read-through on a phone before freeze;
      terminology exactly as provided: WTY®, White Tantric Yoga®, Sadhana, Gurdwara.
      Done when no extraction artifacts or wrong labels remain.

## Timeline (event: December 15–21 → apps live by ~November 24)

| When | Milestone |
|---|---|
| **September** | Store/Firebase/APNs accounts moving (WS4 started) · backend QA done + plugin deployed (WS5) · WS1 development underway |
| **October** | WS1 + WS3 feature-complete · WS2 built · TestFlight and internal Android testing with real WSOL26 content |
| **November** | WS6 · store submissions early November (review buffer) · on-device QA · content complete (WS7) · **apps live by Nov 24** |
| **December** | Content freeze · event ops Dec 15–21: staff publish announcements & alerts |

## Out of scope for this stage

- Camp local network / edge server (summer 2027, Ram Das Puri — R&D per
  [LOCAL-NETWORK.md](LOCAL-NETWORK.md)); note WS1's UpdateAgent should keep the
  backend base URL swappable so the 2027 local server slots in without client changes.
- Group chats / direct messages (messaging phases 3b/3c).
- Home-screen widget, lock-screen "up next".
- Commerce beyond the link-out decision; daily menus / yogi diet content.
