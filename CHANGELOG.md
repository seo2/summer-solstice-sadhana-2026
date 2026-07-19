# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Because the app ships as a static export + PWA, the offline cache version
(`solstice-full-offline-vNN`) is the closest thing to a shipped release marker.
Note the cache bump in an entry whenever one happened.

## [Unreleased]

### Fixed

- Teacher quick-view modal was clipped inside the activity card (the card's
  `backdrop-filter` made it the containing block for `position: fixed`) — now rendered
  via a React portal on `document.body`, overlaying the whole page. It also gained a
  fluid open/close transition (slide-up + fade with staggered inner elements),
  honoring `prefers-reduced-motion`. Cache → v46.

### Added

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

<!--
Template for future entries — keep newest on top.

## [YYYY-MM-DD] cache vNN
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
