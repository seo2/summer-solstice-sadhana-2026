# Project Memory — 3HO Summer Solstice Sadhana app

_Last updated: 2026-07-19. This is a living record — update it as decisions are made._

Running context and decision log for the project: where we are, what we decided (and why),
and how we agreed to work. Complements `CLAUDE.md` (rules for agents) and the planning docs.

## Where the project is now

- Shipped: offline-first PWA (Next.js 15.5 static export + service worker). Program (125
  activities) with filters + detail, local favorites & personal agenda (Dexie/IndexedDB),
  offline Info Hub, zoomable camp map, contact form with local outbox.
- No backend / no login yet. Capacitor installed but no native platforms added.
- Repo has a full docs set and a defined way of working (below). Git remote:
  github.com/seo2/summer-solstice-sadhana-2026, default branch `main`.

## Decisions made (most recent first)

- **Backend for the MVP = WordPress + MySQL.** Custom REST endpoints on the existing
  3ho.org WordPress (we already run WordPress and the app already calls
  `wp-json/3ho-solstice/v1/contact`). Chosen for existing infra/skills, built-in
  users/auth, a content admin UI, and push-from-PHP. Kept swappable: the app consumes a
  **versioned REST bundle** (`updated_since`/ETag) and event data lives in **clean custom
  MySQL tables**, not overloaded CPTs. Known limits accepted: no realtime (messaging =
  polling first) and a full WP stack is heavy for the camp edge server — reassess at those
  stages. Supabase/Firebase/Node are future alternatives, not the MVP.
- **Way of working set** (recorded in `CLAUDE.md`): branch per change set → push → merge;
  maintain `CHANGELOG.md`; document plans in `docs/` and keep `docs/INDEX.md` current.
- **Docs language = English** (repo consistency); event content / `TODO_CONTENT_REVIEW.md`
  may be Spanish. App UI copy stays English unless asked otherwise.

## Documentation that exists (reference and keep updated)

- `README.md` (front door) · `docs/INDEX.md` (master index) · `PRODUCT.md` · `DESIGN.md`
- `docs/ROADMAP.md`, `docs/BACKEND.md`, `docs/NATIVE.md`, `docs/LOCAL-NETWORK.md`,
  `docs/FEATURES.md`
- `CHANGELOG.md` (Keep a Changelog) · `CLAUDE.md` / `AGENTS.md` (agent guidance + Next 15
  warning)
- Note: there is also an in-repo `design/` folder (system, style guide, teachers prototype)
  committed as "system design".

## How we work from now on

- **Git:** each change set on its own `type/topic` branch (`feat/`, `fix/`, `docs/`,
  `chore/`); stage only that change's files (never blind `git add -A` — other WIP must stay
  untouched); push and merge to `main` on completion (or open a PR if review is wanted).
- **Changelog:** every user-visible/structural change gets a bullet under `## [Unreleased]`;
  note offline-cache bumps.
- **Docs:** non-trivial features get a doc before/alongside the code; update `docs/INDEX.md`.
- **Offline cache:** on any visible UI/content/asset/route change, bump the version in BOTH
  `src/components/offline-preloader.tsx` and `next.config.ts`, kept in sync (currently `v43`).
- **Verify for real:** `npm run typecheck && npm run lint && npm run build`, then confirm
  text/assets in the flat `out/*.html`. No success claims without validation.
- **Language:** the product owner usually writes in Spanish — reply in the language they use.
- **Preserve 3HO terms exactly:** WTY®, White Tantric Yoga®, Sadhana, Gurdwara, Ram Das Puri.

## Next up

- **Phase 1 — Backend + accounts on WordPress/MySQL.** Draft the WordPress plugin REST
  routes (`auth`, `sync` with a versioned bundle, `devices` for push) and the multi-event
  MySQL schema (see `docs/BACKEND.md`). Keep the app fully usable logged out & offline.
- Then: native iOS/Android (Capacitor) → community/content features → multi-event → commerce.
- Parallel R&D: campsite local network + edge server (see `docs/LOCAL-NETWORK.md`).
