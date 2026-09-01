# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Because the app ships as a static export + PWA, the offline cache version
(`solstice-full-offline-vNN`) is the closest thing to a shipped release marker.
Note the cache bump in an entry whenever one happened. When a set of changes
ships, its `Unreleased` bullets move into a dated section below — newest on top.

## [Unreleased]

### Added

- **Winter Solstice venue map artwork received and wired** (2026-09-01):
  `references/winter-solstice-map-revised-v3.jpg` (1496×1051 — full venue
  legend: entrance, Inco Park, Kitchen, Bazaar/Yogi Tea, Tantric Shelter,
  Gurdwara, Natural Sarovar, numbered cabins). Imported into the local
  WordPress Media Library, set as the winter test event's `map_image`, and
  verified rendering in the app's per-event zoomable Map tab served from the
  bundle. Closes WS2 entirely. Production step pending: upload to the
  production Media Library when the WSOL26 event is created (WS5). No app code
  changed — no cache bump.

- **WS4 store prep** (cache v65): public **privacy policy** drafted as the app
  route `/privacy` (accurate to what the app actually does; linked from the
  Account screen; registered in the offline preloader) — needs organization
  review and the final public-domain decision before store forms.
  `docs/STORE-OPS.md`: the WS4 runbook — Apple/Google chains step by step,
  privacy-labels & data-safety answer tables derived from the code, review-notes
  template, on-device QA list, and the timeline back from Nov 24. Registered in
  `docs/INDEX.md`.

### Fixed

- Android manifest now declares **`POST_NOTIFICATIONS`** — required on
  Android 13+ for agenda reminders and push to display; without it,
  notifications silently never appear on modern Android.

### Added

- **Local testing kit**: `npm run mock-backend` (`scripts/mock-backend.mjs`,
  promoted from the session mock used to verify WS1/WS3/WS2/WS8) fakes the
  plugin's REST contract — bundle v1→v2 with a favorited-session move,
  announcements/alerts with a `/mock/post` publisher, per-event info pages,
  venue map SVG, and menus — plus `docs/TESTING-LOCAL.md`, a four-level guide
  (app alone · mock backend · local WordPress `3ho.test` · simulators, with
  the Android-emulator `10.0.2.2` note). Registered in `docs/INDEX.md`.
  Dev tooling only — no cache bump.

### Changed

- **Event-neutral shell surfaces — WS2 closed (code)** (cache v64): while a
  synced event is active, the **Home hero now shows that event** — name, date
  range, location, same CTAs — instead of the Summer Solstice artwork
  (`HomeHero` gate), and the Women's Renewal promo card is hidden
  (`BuiltinOnly`; the opt-in reminder banner is personal and stays). The
  **offline splash is event-neutral**: "3HO · Event App · Program, maps &
  announcements for 3HO events" with "Works without signal once loaded" as the
  footer, replacing the Summer Solstice / Ram Das Puri branding. Verified in
  the browser in both states (synced event active and built-in). WS2's only
  remaining item is the real Florida map artwork (content, WS7).

- **Backend plugin UI renamed: "Solstice App" → "Event App"** (2026-08-28): the
  wp-admin menu, the eight screen headings, ACF block descriptions and the plugin
  name itself now read *Event App* — the backend publishes any 3HO event, not only
  Solstice. Labels only: screen slugs, REST namespace `3ho-solstice/v1`, the
  `{prefix}ssa_*` tables, block names and the `[ssa_program]`/`[ssa_teachers]`
  shortcodes are untouched, so no app-side change is needed. Docs updated
  (`docs/HANDOFF.md`, `docs/TESTING-LOCAL.md`). Backend + docs only — no cache bump.

- **Local WordPress QA environment stood up and v0.5.0 verified end-to-end**
  (2026-08-28): plugin activated locally (DB v3 migrated — `ssa_menu_day`,
  `map_image`/`feed_slug`, device pref columns all present), both seeds loaded,
  test menus/map/broadcasts created, and the app run against it via
  `wp server` on `127.0.0.1:8080` (3ho.test's TLS currently hangs). Verified in
  the browser: bundle with menus + mapImage, bell badge → announcements feed
  from real WordPress, Menus opening on "Today", per-event map, anonymous
  `POST /devices` storing prefs, and the P4 feed sync against the production
  checkout feed with the hash gate ("Feed unchanged" on re-run).
  `docs/TESTING-LOCAL.md` Level C rewritten to match the real setup.
- **P4 checkout-feed pipeline approved & implemented** (2026-08-27, plugin
  v0.5.0 working tree in the 3ho.org repo, `php -l` clean): hourly cron +
  per-event "Sync feed now" pull the checkout presenter bundle into the
  `ssa_*` tables with the `pull-program.mjs` merge contract and hash-gated
  `content_version` bumps. `docs/BACKEND-WSOL26.md` status updated; the WS1
  checkout-pipeline task in `docs/WSOL26-PLAN.md` is closed — **WS1 is
  code-complete**. Owner QA list extended in the WP repo changelog.

### Added

- `docs/BACKEND-WSOL26.md` — **P4 proposal** (pending owner approval): the
  checkout-feed → WordPress pipeline that closes WS1. Pull-based on 3ho.org
  (`ssa_event.feed_slug` riding the same DB v3, hourly WP-cron + "Sync feed
  now" button, configurable checkout base), merge semantics identical to
  `pull-program.mjs` (feed owns only `presenter-*` rows with soft-deletes so
  change alerts report cancellations; curated teacher content always wins),
  hash-gated `content_version` bumps so polling never spams client refetches.
  No app changes needed — content flows through the normal bundle sync.

- **Anonymous push registration + notification preferences — WS3 N1 app side**
  (cache v63, pairs with plugin v0.5.0): the PushAgent no longer waits for
  sign-in — it registers on app start whenever the OS permission is already
  granted, re-registers on sign-in/sign-out (sign-out now keeps the device
  reachable **anonymously** instead of unregistering) and on active-event
  changes, sending `prefs {news, alerts}`, the active event slug, and the app
  version. New **Notifications card** on the Announcements screen with two
  locally persisted toggles — "Event alerts" (default on) and "News about
  future events" (default OFF, store-compliant opt-in); turning a toggle on is
  the in-context moment for the OS permission prompt. Toggle persistence
  verified in the browser; native registration/delivery QA happens on device
  with APNs/FCM (WS4).

- **Synced-event content surfaces — WS2 + WS8 app side** (cache v62), all
  offline-first from the local event store and verified end-to-end against a
  mock of the v0.5.0 bundle:
  - **Per-event Info Hub**: while a synced event is active, `/info` renders the
    event's own `infoPages` (collapsible cards; paragraphs + bullet lists from
    wp-admin-authored text) instead of the built-in Ram Das Puri booklet, with
    an empty state until the event team publishes. Built-in Info Hub unchanged
    otherwise.
  - **Per-event venue map**: the zoomable MapViewer now accepts any map image
    (`event.mapImage`, pre-cached offline at sync time, dimensions measured on
    load); legend pins remain built-in-only; a synced event without a map shows
    its venue list instead of the wrong campground. Built-in map + zoom
    verified intact (fit, ±25% steps).
  - **Menus** (`/menus`): day chips opening on today, meal cards in
    breakfast→lunch→dinner→snack order with dish lists and dietary-note badges,
    fed by the bundle's `menus`; a Home "Menus" tile appears only when the
    active event has menu content. Route registered in the offline preloader.

### Changed

- `docs/BACKEND-WSOL26.md` — status PROPOSAL → **approved & implemented**
  (2026-08-27): P1 anonymous devices + notification prefs, P2 per-event venue
  map, P3 daily menus are coded in the 3ho.org repo working tree as plugin
  **v0.5.0 / DB v3**, `php -l` clean (that repo's CHANGELOG has the detail;
  owner QA + commit pending, per its rules). `docs/WSOL26-PLAN.md` annotated:
  WS8 menu backend done; WS2 map backend done (app side + artwork pending);
  WS3 anonymous registration server side done (app side pending).

### Added

- `docs/BACKEND-WSOL26.md` — proposal (pending owner approval) for the plugin
  changes the remaining WSOL26 workstreams need, written against v0.4.0 source:
  P1 anonymous device registration + notification preferences with the push
  audience model (WS3/N1), P2 per-event venue map (`ssa_event.map_image`, WS2),
  P3 daily menus (`ssa_menu_day` table + admin + bundle field, WS8) — shipping
  together as plugin v0.5.0 / DB v3. Documents the discovery that per-event
  **info pages already exist server-side** (bundle `infoPages`), so WS2
  app-side rendering is unblocked without plugin changes (noted in
  `docs/WSOL26-PLAN.md`). Registered in `docs/INDEX.md`.

- **Favorited-session change alerts — WS3 N2b**: when the UpdateAgent applies a
  refreshed bundle, it diffs the user's favorited sessions against the previous
  version — a move in time and/or venue or a cancellation produces a specific
  notice (e.g. `"Morning Sadhana" moved to Wed 8:00 AM · Lakeside Hall.`), shown
  as the UpdateAgent toast in the browser and fired as a native local
  notification on the apps (`notifyScheduleChanges`). Computed fully on-device:
  works logged out, no per-user server targeting. Verified against the mock
  backend. Cache → v61.

### Fixed

- ReminderAgent now reschedules when a runtime sync bumps the active bundle's
  **version** (previously only on favorites/slug changes) — so a favorited
  session that moved gets its 15-minute reminder at the new time instead of the
  stale one.

- **Announcements & Alerts in the app — WS3 phase 3a** (`/announcements`,
  `src/lib/messages.ts`, AlertsAgent, header bell): the feed shows the active
  event's official Announcements and urgent Alerts (amber, newest first), stored
  locally in Dexie (`solstice-messages`) so it reads offline once fetched, with a
  manual refresh button and an empty state. A background AlertsAgent polls the
  backend's cheap `GET /updates` endpoint (on boot, back-online, tab-visible, and
  every 2 minutes while open) and fetches message bodies only for channels with
  news; the active synced event polls its own base URL, the built-in event polls
  the shared backend origin. A **bell in the global header** carries the unread
  count from a locally tracked read cursor (no account needed; clears on opening
  the feed). Shapes mirror the plugin's `class-ssa-messages.php` exactly;
  verified end-to-end against a mock (badge, feed render, incremental new-post
  arrival, read clearing). `/announcements` registered in the offline preloader.
  Cache → v60.

- **Runtime content sync — WS1 UpdateAgent** (`src/components/update-agent.tsx` +
  `src/lib/event-sync.ts`): a background agent refreshes every locally synced
  event bundle over the internet — shortly after app start, when the app comes
  back online, when the tab becomes visible, and every 15 minutes while open —
  using the incremental `sync?event=&since=` contract. Each event refreshes
  against its own stored base URL with a monotonic version guard (mirror-ready
  for the 2027 camp server). When the **active** event's content changed, a quiet
  self-dismissing "Program updated" toast appears; content applies silently via
  the existing live queries. Bundle photos (teachers + program, cross-origin
  WordPress media included) are **pre-cached into the offline cache at sync
  time** — implemented with fetch+`cache.put` because `cache.add()` rejects
  opaque responses. Verified end-to-end against a mock backend: v1→v2 update
  with toast, `unchanged` incremental path, photo cached as opaque, updated
  program rendering offline. Cache → v59.

- `docs/FUNCIONALIDADES.md` — Spanish-language feature summary for stakeholders:
  every app capability marked as existing (✅) or new for the WSOL26 stage (🆕),
  plus what stays out of scope. Registered in `docs/INDEX.md`.
- `npm run trello-import` (`scripts/trello-import.mjs` +
  `scripts/wsol26-trello-cards.json`): batch-creates the WSOL26 board content via
  the Trello REST API — one list, 9 workstream cards with descriptions, 18
  checklists, 67 items. Credentials via `TRELLO_KEY`/`TRELLO_TOKEN` env vars
  (never stored); `--dry-run` previews without writing; running without
  `--board` lists the account's open boards with their short links; `--list`
  reuses an existing list by name (case-insensitive) or creates it. Import instructions added
  to `docs/WSOL26-TRELLO.md` (API script, native multi-line paste, Power-Up
  alternatives).
- `docs/WSOL26-TRELLO.md` — Trello card export of the WSOL26 plan: one card per
  workstream (WS1–WS7) with title, description, and checklists, plus a multi-line
  title block for quick card creation. Registered in `docs/INDEX.md`.

### Changed

- **WS6 (multi-event favorites sync) and WS9 (messaging) deferred to the next
  version, post-WSOL26** (owner decision 2026-08-26): moved from active
  workstreams to a "Next version" section in `docs/WSOL26-PLAN.md` (timeline and
  WS4 store-compliance notes adjusted — no UGC requirements apply to this
  submission), re-tagged "Post-WSOL26" in `docs/WSOL26-TRELLO.md` and
  `scripts/wsol26-trello-cards.json`, and listed under "Siguiente versión" in
  `docs/FUNCIONALIDADES.md` (new items now 7).
- `docs/WSOL26-PLAN.md` — **WS9 · Messaging added to the stage** (owner request
  2026-08-25): work-team (seva) channels where leaders create groups, add members
  and post daily tasks/announcements/meetings (9a, builds first), user-created
  groups (9b) and DMs (9c) if the schedule holds, plus the store-required UGC
  safety set (report/block/moderation/community rules) now reflected in WS4
  compliance. Messaging 3b/3c removed from out-of-scope (only the realtime socket
  companion stays out — polling-first stands). Server schema/endpoints groundwork
  already live (DB v2). `docs/WSOL26-TRELLO.md` gains Card 9.
- `docs/WSOL26-PLAN.md` — **WS8 · Menus & nutrition added** (owner request
  2026-08-25, pulled forward from the Phase 3 backlog in `docs/FEATURES.md`):
  `menu_day` content model in the sync bundle, Menus UI (today's meals + day
  navigation, offline), nutrition/yogi-diet guidance pages, and the WSOL26 menu
  content task. Removed from the out-of-scope list; October milestone now includes
  WS8; menus don't gate store submission (content arrives via sync after release).
  `docs/WSOL26-TRELLO.md` gains Card 8; `docs/FEATURES.md` marks the feature as
  pulled forward.
- `docs/WSOL26-PLAN.md` — **notification model added** (owner intent 2026-08-25):
  N1 future-event news to every installed app (requires **anonymous device
  registration** — today push tokens register only after sign-in), N2 personal
  per-event notifications (local session reminders already built; new
  favorited-session **change alerts** computed on-device by diffing bundle
  refreshes — no account or per-user server targeting needed), N3 official
  announcements + urgent alerts during the event. WS3 retitled "Notifications:
  announcements, alerts & push" with new tasks (anonymous registration,
  notification preferences toggles, change alerts) and **server-side push delivery
  promoted P1 → P0**; WS4 compliance notes marketing-push opt-in.
  `docs/WSOL26-TRELLO.md` Card 3 updated to match (three checklists).
- `docs/WSOL26-PLAN.md` — every task now carries an explanation: what it is, why
  it matters, and what "done" looks like. Docs only — no cache bump.

- **App id changed to `org.threeho.eventapp`** (decision D5, closed while nothing
  is on the stores — the id is immutable on Google Play once published): Capacitor
  `appId`, Android `namespace`/`applicationId`, `package_name`/`custom_url_scheme`
  strings, `MainActivity` package moved to `org/threeho/eventapp/`, iOS
  `PRODUCT_BUNDLE_IDENTIFIER` (both configurations). Native-only — no visible UI
  change, no cache bump. Store records (App Store Connect / Play Console) must be
  created with this id.
- **Shell renamed to "3HO Event App"** (decision D2 of the WSOL26 plan): PWA
  manifest (`name` "3HO Event App", `short_name` "3HO Events"), document
  title/description, iOS web-app title, global header brand ("3HO / Event App"),
  install-page copy, Capacitor `appName`, iOS `CFBundleDisplayName`, Android
  `app_name`/`title_activity_main`. Event content branding (Home, program, map,
  Women's Renewal, built-in event name) is untouched — the shell is now
  event-neutral, the events keep their own names. App id unchanged
  (`org.threeho.summersolstice2026`) — pending decision D5 before first store
  publication. Cache → v58.
- `docs/WSOL26-PLAN.md` updated with resolved decisions (2026-08-25): D1 same app
  + the web/PWA version continues; D2 shell rename implemented; D3 WordPress as
  single content source with **mirror-ready sync constraints** for the summer-2027
  camp network (single configurable origin, relocatable media URLs, monotonic
  bundle versions, discovery/failover deferred); D4 real event data from the live
  checkout feed — **Winter Solstice Sadhana Celebration 2026, Dec 15–21,
  Retreats By The Lake, Lake Wales, FL**, tickets on sale, presenter program still
  empty in the feed; new open decision **D5** (durable app id before first store
  publication). Timeline anchored to real dates (apps live by ~Nov 24).

### Added

- `docs/WSOL26-PLAN.md` — next-stage plan for **Winter Solstice 2026 (Florida)**:
  gating decisions (single app via multi-event vs separate build, store branding,
  WordPress as single content source), seven workstreams (runtime sync UpdateAgent,
  per-event Info Hub & venue map gap, announcements/alerts app-side, store ops,
  backend QA/deploy, multi-event favorites sync, content), suggested Sep–Dec
  timeline. Camp local network explicitly out of scope (targets summer 2027 at
  Ram Das Puri, which has no connectivity — the Florida venue has internet).
  Registered in `docs/INDEX.md`. Docs only — no cache bump.
- `docs/HANDOFF.md` — project handoff for continuing in Claude Code: state of the
  app and WordPress repos, pending QA gaps, working knowledge (cache rule, base URL,
  gotchas), first-session checklist.
- `docs/REQUIREMENTS.md` — stakeholder-ready features & technical requirements for
  the native iOS/Android version (functional ✅/🔧/📋 status, client/backend stacks,
  offline mandate, store-readiness ops, delivery summary). Docs only — no cache bump.

### Changed

- `README.md` rewritten to describe the current state of the app — accounts and
  favorites sync, native iOS/Android platforms, synced events / Sync Lab, the
  checkout-feed content pipeline (`pull-program`), and the WordPress backend —
  replacing the pre-backend Phase 0 snapshot ("no backend, no login, no native
  platforms"). This changelog was restructured from one accumulated
  `[Unreleased]` block into dated sections per shipped change set. Docs only —
  no cache bump.

## [2026-08-05]

### Added

- `npm run pull-program` (`scripts/pull-program.mjs`): build-time import of the
  published Teacher & Musician program from the checkout platform
  (`GET {register.3ho.org}/wp-json/wsol/v1/presenter/bundle?event=wsol26`, CORS `*`).
  Mixed-source merge: only `presenter-*` program entries belong to the feed (replaced
  wholesale each run; stable ids so favorites survive reschedules), teachers are
  enriched/appended by `facilitatorNames` match, missing venues/categories appended,
  photos downloaded to `public/images/teachers/` and rewritten to local paths.
  Supports `--base`, `--event`, `--dry-run`, `--insecure` (local checkout.test).
  Docs in `docs/TEACHERS.md` ("Checkout feed import"). No shipped content changed
  yet — no cache bump. Phase 2 (runtime sync against the same endpoint) pending.

## [2026-07-20] — cache v52 → v57

### Added

- **Push notifications groundwork (app side)**: `@capacitor/push-notifications`
  added; a native-only PushAgent registers the device token with the backend
  `devices` endpoint after sign-in and unregisters on sign-out; iOS AppDelegate
  forwards APNs callbacks. Brand asset sources added under `assets/` (icon/splash)
  for `npx @capacitor/assets generate`; final 1024px icon art pending before store
  submission. Server-side sending (APNs/FCM) ships with the messaging phase.
  Cache → v57.
- **Native platforms (Phase 2 start)**: `ios/` and `android/` Capacitor projects
  scaffolded, committed and synced with the static build. App id corrected to
  `org.threeho.summersolstice2026` (Android forbids digit-leading package segments —
  changed before any store publication). **Agenda reminders wired**: on the native
  app, a reminder fires 15 minutes before each favorited session (built-in + active
  synced event), rescheduled automatically as favorites change; no-op in the
  browser/PWA. ESLint now ignores the native scaffolds. Cache → v56.
- **Site accounts sign in to the app**: the login form accepts a 3ho.org
  **username or email** (backend `auth/login` updated accordingly), with a hint
  making it explicit, plus a "Forgot your password?" link to the site's standard
  WordPress reset. Cache → v55.
- **Account entry in the global header** (top right, every screen): a neutral user
  icon when signed out, the user's initials on the brand gradient when signed in —
  both lead to `/account`. Cache → v54.
- **Accounts** (`/account`, quick tile on Home — closes Phase 1 app-side, see
  `docs/ACCOUNTS.md`): sign in / create account against the WordPress backend
  (WordPress users + bearer tokens), profile view, sign out. **Favorites sync
  cross-device**: server copy merges into local on first sync (never destructive),
  local changes push with tombstone-tracked deletions (Dexie db v3) and last-write-
  wins on the server; a background agent debounces pushes while signed in. The app
  remains fully usable logged out and offline; backend origin is configurable via
  the shared base-URL override. Cache → v53.
- **Favorites from teacher views**: the sessions listed in the teacher quick-view
  modal and on the full teacher profile page now include the heart toggle, so
  activities can be saved as favorites right from a teacher's card — for the
  built-in event and synced events alike. Cache → v52.

## [2026-07-19] — cache v44 → v51

### Added

- **"Your events" switcher on Home**: once at least one synced event exists locally,
  Home shows a card listing the built-in Summer Solstice 2026 and every synced event
  (name, dates, location) with one-tap activation, a check on the active one, and
  per-event removal. Hidden entirely for regular attendees with no synced events.
  Cache → v50.
- **Synced event views**: a synced event (fetched in Sync Lab → "Use this event in the
  app") now renders in the full app experience — Program with all filters, Favorites,
  and Teachers — swapping the built-in content client-side from the local event store
  (new Dexie DB `solstice-event-store`; works offline once synced). Synced activities
  open a full **detail sheet** (no static pages exist for them) with favorite toggle;
  synced teachers' quick view shows all sessions plus the bio inline. An amber
  **"Viewing event" banner** on Home/Program/Favorites/Teachers names the active event
  and switches back to Summer Solstice 2026. Built-in content and offline flow are
  untouched when no synced event is active. Cache → v49.
- **Sync Lab** (`/sync-lab`, unlinked internal test bench): fetches the versioned
  content bundle from a WordPress backend running the `3ho-solstice-app` plugin
  (configurable base URL + event slug, persisted locally), reports version/ETag/
  timing/counts, renders teachers and program from the live bundle with the app's
  design, and verifies the `since`/unchanged incremental path. Groundwork for the
  real sync client. Cache → v48.
- **Program advanced filters** (per `design/program-style-guide.html` §03): expandable
  "Advanced filters" panel under the search/day strip/selects with multi-select
  category chips, time-of-day presets (Morning/Midday/Afternoon/Evening), a custom
  hour range dual slider (3:00 AM–10:30 PM, 15-min steps, 1h minimum gap), an
  active-filter count badge, and Clear/Apply. The quick Category select and the
  multi-select chips drive the same dimension without conflicting. Cache → v47.
- First teacher bio seeded in `src/data/teachers.json` (Har Dev Khalsa, from the
  `design/` prototype) — verifies the profile "About" section renders when a bio
  exists and stays hidden when empty. Remaining bios pending from the production
  team. Cache → v45.
- **Teachers section** (static-first, per `docs/TEACHERS.md`): `/teachers` directory
  (34 teachers with photo/initials avatars, duo support, session counts) and
  `/teachers/[id]` full profiles (sessions grouped by day, linked to program detail;
  "About" appears once a bio exists in `src/data/teachers.json`). Teacher quick-view
  modal opens from the facilitator photo/name on program cards and detail pages.
  Entry points: Home quick tile + "Teachers" link on the Program header. New routes
  registered in the offline preloader; cache → v44.
- `docs/MESSAGING.md` — messaging/alerts design: unified channel model (DM, group,
  official announcements, work-group channels, alerts feed), REST API sketch, and the
  **polling-first, socket-ready** decision (realtime companion later).
- `docs/TEACHERS.md` — teacher/presenter info spec: data model, program linking,
  static-first rollout then backend bundle.
- Project documentation set and navigation index (`docs/INDEX.md`).
- `CHANGELOG.md` (this file).
- Planning docs: `docs/ROADMAP.md`, `docs/BACKEND.md`, `docs/NATIVE.md`,
  `docs/LOCAL-NETWORK.md`, `docs/FEATURES.md`.
- `docs/PROJECT-MEMORY.md` — living context & decision log (current state, decisions,
  working agreement, next steps); linked from `docs/INDEX.md`.
- Git workflow (branch per change set → push → merge), changelog discipline, and
  documentation discipline sections in `CLAUDE.md`.

### Changed

- Auth decision resolved in `docs/BACKEND.md`: **custom opaque bearer tokens** on
  WordPress users (no JWT plugin, no Application Passwords). Phase 1 backend skeleton
  (`3ho-solstice-app` plugin: auth/sync/devices + multi-event `ssa_*` tables + seed
  CLI) implemented in the separate 3ho.org repository.
- `README.md` rewritten as a clear front door with a link to the docs index.
- Backend direction set to **WordPress + MySQL for the MVP** (custom REST on the existing
  3ho.org WordPress, kept swappable via a versioned REST bundle). Rewrote `docs/BACKEND.md`
  accordingly; updated `docs/ROADMAP.md` and `docs/NATIVE.md` to match. Supabase and others
  are now listed as future alternatives to reassess after the MVP.
- v2 scope decisions recorded across `docs/ROADMAP.md`, `docs/BACKEND.md`,
  `docs/FEATURES.md`: messaging = polling-first/socket-ready; commerce (Phase 5) =
  **link out to the existing ticket-sales website** first, no in-app payments; teachers
  can ship static-first before the backend.

### Fixed

- Sync Lab now saves every successfully fetched bundle to the local event store
  right away, so it appears in Home → "Your events" without needing to activate it
  first ("Use this event in the app" now only switches the active event). Cache → v51.
- Teacher quick-view modal was clipped inside the activity card (the card's
  `backdrop-filter` made it the containing block for `position: fixed`) — now rendered
  via a React portal on `document.body`, overlaying the whole page. It also gained a
  fluid open/close transition (slide-up + fade with staggered inner elements),
  honoring `prefers-reduced-motion`. Cache → v46.

<!--
Template for future entries — keep newest on top.

## [YYYY-MM-DD] — cache vNN
### Added
### Changed
### Fixed
### Removed
-->

---

Baseline before this changelog existed (from git history, most recent first):

- `foto de rai` — teacher photo update.
- `ajuste día domingo y día actual para programa` — Sunday / current-day handling in the program.
- `ajustes programa` — program adjustments.
- `program update`.
- `sunday gurdwara`.
