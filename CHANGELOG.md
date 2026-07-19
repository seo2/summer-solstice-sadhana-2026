# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Because the app ships as a static export + PWA, the offline cache version
(`solstice-full-offline-vNN`) is the closest thing to a shipped release marker.
Note the cache bump in an entry whenever one happened.

## [Unreleased]

### Added

- Project documentation set and navigation index (`docs/INDEX.md`).
- `CHANGELOG.md` (this file).
- Planning docs: `docs/ROADMAP.md`, `docs/BACKEND.md`, `docs/NATIVE.md`,
  `docs/LOCAL-NETWORK.md`, `docs/FEATURES.md`.
- `docs/PROJECT-MEMORY.md` — living context & decision log (current state, decisions,
  working agreement, next steps); linked from `docs/INDEX.md`.
- Git workflow (branch per change set → push → merge), changelog discipline, and
  documentation discipline sections in `CLAUDE.md`.

### Changed

- `README.md` rewritten as a clear front door with a link to the docs index.
- Backend direction set to **WordPress + MySQL for the MVP** (custom REST on the existing
  3ho.org WordPress, kept swappable via a versioned REST bundle). Rewrote `docs/BACKEND.md`
  accordingly; updated `docs/ROADMAP.md` and `docs/NATIVE.md` to match. Supabase and others
  are now listed as future alternatives to reassess after the MVP.

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
