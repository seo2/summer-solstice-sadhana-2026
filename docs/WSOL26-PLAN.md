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

## Notification model

Product intent (owner, 2026-08-25): once people have the app installed we can reach
them on three levels, each with different plumbing:

| # | Type | How it works | Where it lands |
|---|---|---|---|
| N1 | **Future-event news (re-engagement)** — e.g. "Summer Solstice 2027 registration is open", sent to everyone with the app installed | Real push (APNs/FCM) to **all registered devices**, opt-in. Requires **anonymous device registration** — today the app only registers a push token after sign-in, which would reach almost nobody | WS3 (app + backend) + WS4 (consent/compliance) |
| N2 | **Personal, per event** — favorites / personalized agenda | (a) **Session reminders** 15 min before each favorited session — already built, local and offline, no server involved. (b) **Change alerts**: when a sync refresh changes a favorited session (time, venue, cancellation), the app notifies — computed **on the device** by diffing the old and new bundle, so it needs no account and no per-user server targeting | (a) shipped · (b) WS3, depends on WS1's UpdateAgent |
| N3 | **Official announcements & urgent alerts during the event** | Feed + polling while the app is open; **real push for urgent alerts** so they reach closed apps — this promotes server-side push delivery from P1 to **P0** | WS3 + WS5 |

## Workstreams

Each task carries what it is, why it matters, and what "done" looks like.

### WS1 — Runtime content sync (P0 · app)

The piece that makes internet updates real. Today fresh content only reaches users
baked into an app build or through the internal Sync Lab — neither works for a live
event where the schedule changes daily.

- [x] **UpdateAgent (automatic background refresh)** — ✅ done 2026-08-26 (cache
      v59; verified end-to-end against a mock backend). A client agent that checks the
      WordPress backend for a newer version of the active event's content bundle
      (program, teachers, venues, categories) on app start and periodically while the
      app is open. It reuses the versioned-bundle contract the server already exposes
      (ETag / `updated_since`), downloads only when something actually changed, and
      writes into the local event store — so the next fully-offline session already has
      the fresh content. Done when a schedule change published in wp-admin appears on
      an attendee's phone within minutes, with zero user action.
- [x] **Update UX** — ✅ done 2026-08-26 (quiet self-dismissing "Program updated"
      toast; silent apply through live queries). What the attendee experiences when content changes: a quiet
      "Program updated" indicator instead of a disruptive reload, silent apply in the
      background, and never any blocking of offline reading. Includes choosing the
      refresh cadence and keeping battery/data use negligible. Done when updates feel
      invisible but trustworthy.
- [x] **Checkout feed → WordPress pipeline (per D3)** — ✅ implemented 2026-08-27
      (P4 in [BACKEND-WSOL26.md](BACKEND-WSOL26.md): pull-based hourly cron +
      "Sync feed now" on 3ho.org, same merge contract as `pull-program.mjs`,
      hash-gated version bumps; plugin v0.5.0 working tree, pending owner QA).
      With this, WS1 is code-complete. Originally: automate importing the
      published Teacher & Musician program from the registration platform into
      WordPress. Today `pull-program` bakes that feed into the app's static files at
      build time; moving the import server-side makes WordPress the single source of
      truth, so program changes reach the app through normal sync with **no app
      rebuilds**. Done when a program change in the checkout platform lands in the WP
      bundle without touching the app repo.
- [x] **Offline photos for synced events** — ✅ done 2026-08-26 (photos pre-cached
      at sync time, cross-origin included). Teacher photos in synced bundles are
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

- [x] **Info pages per event in the sync bundle** — ✅ done 2026-08-27 (cache v62):
      backend was already live (`ssa_info_page` → bundle `infoPages`); the app now
      renders the active synced event's info pages offline (collapsible cards,
      paragraphs + bullet lists) and never shows the built-in Ram Das Puri guide
      while a synced event is active (empty state when nothing published yet).
      Real WSOL26 texts are a WS7 content task.
- [x] **Florida venue map** — ✅ closed 2026-09-01: the real Winter Solstice map
      artwork arrived (`references/winter-solstice-map-revised-v3.jpg`,
      1496×1051), was loaded into the local WordPress Media Library, set on the
      test event, and **verified rendering in the app's zoomable viewer** served
      from the bundle. Backend + app side were done 2026-08-27 (map per event,
      dims measured on load, offline pre-cache, venue-list fallback, built-in map
      untouched). Remaining ops note: when the WSOL26 event is created in
      **production** (WS5), upload the same JPG to its Media Library and set it
      in the Events screen.
- [x] **Behavior of SSOL-specific sections** — ✅ done 2026-08-28 (cache v64):
      while a synced event is active, the **Home hero shows that event** (name,
      dates, location, same CTAs) instead of the Summer Solstice artwork, and the
      Women's Renewal promo is hidden (`BuiltinOnly` gate — the reminder stays,
      it's personal opt-in). The offline splash is now **event-neutral** ("3HO
      Event App · Program, maps & announcements for 3HO events") instead of
      SSOL26-branded. With this, **WS2 is code-complete** — only the Florida map
      artwork (WS7 content) remains.
- [x] **Venue map pins & quick-access chips for synced maps** — ✅ app side
      done 2026-09-04 (cache v76), reopening WS2 for design parity with the
      Summer Solstice PWA: the Map tab draws tappable pins, featured chips that
      center the map, and the "All venues" legend from the bundle's `venues[]`
      (`mapPoint` in percent of the image, `color`, `number`, `featured` rank,
      `kind: landmark` for map-only points such as restrooms and parking). The
      WSOL26 fixture carries 22 pins measured on the real Florida artwork,
      which the mock backend now serves. Plugin side: **P6** implemented the
      same day in the 3ho.org working tree (v0.7.0 / DB v5, verified on local
      WordPress; owner commit + deploy pending — see
      [BACKEND-WSOL26.md](BACKEND-WSOL26.md)). Content: the venues CSV was
      imported into production on 2026-09-04 but landed before P6 (22 flat
      venues, no pins); re-import it after the deploy to fill them in.
- [x] **Info Hub design parity for synced events** — ✅ app side done
      2026-09-04 (cache v80): the built-in grouped Info Hub (topic grid, group
      headers, section cards with lists, definitions and quotes) is now a
      shared renderer used by synced pages too, with `## Heading` / `1.` /
      `>` / `Label: value` conventions for wp-admin texts and a new
      "Nutrition" topic. Grouping falls back to known page ids, so WSOL26 in
      production is fully grouped with no backend change; **P7** (`group` /
      `sort` / `featured` columns) stays optional for new pages. Content: the
      WSOL26 pages still carry the Ram Das Puri texts — rewriting them for
      Florida is WS7.

### WS3 — Notifications: announcements, alerts & push (P0 · app + backend)

Implements the notification model above. The announcements/alerts server side already
works (staff publish from wp-admin; polling API live); what's missing is the app
surface, real push delivery, and reaching devices that never sign in. Design in
[MESSAGING.md](MESSAGING.md).

- [x] **Feed UI** — ✅ done 2026-08-27 (`/announcements`, cache v60): official
      Announcements (white) and urgent Alerts (amber) newest first, offline from the
      local store, manual refresh button, empty state. Verified against a mock of
      the exact plugin contract.
- [x] **Polling agent + unread badge** — ✅ done 2026-08-27: AlertsAgent polls the
      cheap `GET /updates` (boot/online/visibility/every 2 min), fetches bodies only
      for channels with news, and a bell in the global header shows the locally
      tracked unread count (works logged out; badge clears on opening the feed).
- [x] **Anonymous device registration (enables N1)** — ✅ app + server done
      2026-08-27 (cache v63; server in plugin v0.5.0 working tree): the PushAgent
      now registers on app start when the OS permission is already granted —
      account or not — re-registers on sign-in/sign-out (sign-out keeps the device
      reachable anonymously) and on active-event changes, sending prefs + event +
      app version. End-to-end delivery QA needs a physical device with APNs/FCM
      (WS4). Previously the PushAgent registered
      the push token only after sign-in and unregisters on sign-out — future-event
      news would reach almost nobody. Register the device (with its notification
      preferences and last-active event) once permission is granted, account or not;
      backend `devices` endpoint accepts account-less registrations. Done when a
      fresh install with no account is reachable by an "all devices" send.
- [x] **Notification preferences** — ✅ done 2026-08-27 (cache v63): "Event
      alerts" (default on) and "News about future events" (default OFF — opt-in)
      toggles on the Announcements screen, persisted locally and sent with every
      device registration; verified persistence in the browser. The
      "provably stops delivery" check runs with the real sender (WS4/WS5 QA).
- [x] **Favorited-session change alerts (N2b)** — ✅ done 2026-08-27 (cache v61):
      the UpdateAgent diffs favorited sessions on every applied bundle — time/venue
      moves and cancellations produce a specific toast in the browser and a native
      local notification on the apps. Bonus fix: the ReminderAgent now also
      reschedules on bundle **version** changes, so a moved session's 15-minute
      reminder follows the new time. On-device: works logged-out, no per-user
      server targeting. Verified against the mock backend.
- [x] **Notification permission in context** — ✅ done 2026-08-27: the OS prompt
      only ever appears in context — on the first favorited session (reminders,
      existing behavior) or when the user turns a notification toggle ON; app
      start never prompts (the PushAgent registers only when permission was
      already granted).
- [ ] **Push delivery server-side (P0 — promoted per N1/N3)** — Real APNs/FCM
      sending on the existing `threeho_ssa_broadcast_posted` hook, with an audience
      model: urgent alerts → devices on the event; future-event news → all opted-in
      devices. Staff send from the existing wp-admin publisher. Done when a test
      alert wakes a locked test device and an "all devices" news send reaches a
      logged-out install.

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
- [ ] **Privacy & review compliance** — *Progress 2026-08-28 (cache v65):
      privacy policy drafted at the app route `/privacy` (linked from Account —
      needs org review + the final public domain decision); privacy-labels and
      data-safety answer tables + review-notes template ready in
      [STORE-OPS.md](STORE-OPS.md); Android `POST_NOTIFICATIONS` permission fixed.
      **New requirement surfaced: in-app account deletion** (Apple 5.1.1(v) —
      the app has in-app registration), needs a plugin endpoint + Account UI
      before iOS submission.* Public privacy policy URL, App Store privacy
      labels and Play data-safety form (accounts optional, favorites sync, push
      tokens — including anonymous device registration), review notes explaining
      link-out ticket sales (no in-app purchases). Future-event news pushes (N1) are
      opt-in with an in-app toggle — both stores treat marketing pushes without
      consent as a rejection reason. Messaging is deferred post-WSOL26, so no UGC
      requirements apply to this submission (they become mandatory whenever WS9
      ships). Done when both store forms are submitted without red flags.
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

### WS8 — Menus & nutrition (P1 · app + backend + content)

Pulled forward from the Phase 3 backlog ([FEATURES.md](FEATURES.md)) at the owner's
request (2026-08-25): daily food menus plus nutrition / yogi-diet guidance, alongside
the existing content (event info, program + detail, teachers, contact). Key property:
menu content arrives through the sync bundle, so it **doesn't gate store submission**
— menus can land, and change daily, after the apps are already live.

- [x] **Menu content model in the bundle (`menu_day`)** — ✅ backend done
      2026-08-27 (plugin v0.5.0 working tree, pending owner QA): `ssa_menu_day`
      table, "Menus" wp-admin screen, JSON Import type with dry-run, and bundle
      `menus: [{date, meal, title, items[], notes}]`; every write bumps
      `content_version` so the UpdateAgent picks it up.
- [x] **Menus UI in the app** — ✅ done 2026-08-27 (cache v62): `/menus` with day
      chips (opens on today when in range), meal cards in breakfast→lunch→dinner→
      snack order, dish lists and dietary-note badges; offline from the local
      store; a Home "Menus" tile appears only when the active event has menu
      content. Mid-event changes arrive via the UpdateAgent.
- [ ] **Nutrition & yogi-diet guidance** — Editorial content explaining the solstice
      diet and its intent; **machinery ready** (rides the per-event info pages,
      which now render in the app) — what remains is writing the guidance texts
      (WS7/WS8 content task).
- [ ] **WSOL26 menu content** — The kitchen/production team writes the real menus
      for December 15–21 plus dietary notes (content task, parallel with WS7). Done
      when real menus are loaded in WordPress and verified on device.

## Next version (post-WSOL26) ⏭️

Deferred by owner decision **2026-08-26** — these ship in the release after the
event, not in the WSOL26 stage:

### WS6 — Favorites sync for synced events (app)

Today only the built-in event's favorites sync across devices; favorites, agenda,
and reminders already **work locally** for synced events — this is only the
cross-device copy. Task: extend the sync client to push/pull favorites per event
(the server contract already carries an `event` field), with merge-on-login and
tombstoned deletions.

### WS9 — Messaging: work-team channels, groups & DMs (app + backend)

People message each other, create groups, and **work-team (seva) leaders create
channels, add members, and post daily tasks, announcements, and meetings**. Design
ready in [MESSAGING.md](MESSAGING.md) (polling-first); server schema groundwork
(channel/member/message tables) already live. Order when it ships: 9a work-team
channels → 9b user groups → 9c DMs (opt-in discoverability). **Whenever messaging
ships, the UGC set is store-mandatory**: report, block, staff moderation, community
rules — Apple and Google require it for user-generated content.

## Timeline (event: December 15–21 → apps live by ~November 24)

| When | Milestone |
|---|---|
| **September** | Store/Firebase/APNs accounts moving (WS4 started) · backend QA done + plugin deployed (WS5) · WS1 development underway |
| **October** | WS1 + WS3 feature-complete · WS2 + WS8 built · TestFlight and internal Android testing with real WSOL26 content |
| **November** | Store submissions early November (review buffer) · on-device QA · content complete (WS7) · **apps live by Nov 24** |
| **December** | Content freeze · event ops Dec 15–21: staff publish announcements & alerts |

## Out of scope for this stage

- Camp local network / edge server (summer 2027, Ram Das Puri — R&D per
  [LOCAL-NETWORK.md](LOCAL-NETWORK.md)); note WS1's UpdateAgent should keep the
  backend base URL swappable so the 2027 local server slots in without client changes.
- Realtime socket companion for messaging — the polling-first decision stands
  ([MESSAGING.md](MESSAGING.md)); WS9 ships on polling.
- Home-screen widget, lock-screen "up next".
- Commerce beyond the link-out decision.
