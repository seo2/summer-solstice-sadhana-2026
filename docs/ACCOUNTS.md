# Accounts in the app

User accounts against the WordPress backend (`3ho-solstice-app` plugin) — the
app-side completion of Phase 1 ([ROADMAP.md](ROADMAP.md), [BACKEND.md](BACKEND.md)).

> Core principle unchanged: the app is fully usable **logged out and offline**.
> An account only adds cross-device sync of favorites (and later: push, messaging).

## Status (2026-09-04): sign-in hidden until further notice

Attendees currently have no way to create an account — in-app sign-up was
already off for the first store release ([STORE-OPS.md](STORE-OPS.md)), and
account creation on 3ho.org is not open to them — so the sign-in UI is hidden
too. `ACCOUNT_SIGN_IN_ENABLED = false` in `src/lib/features.ts` (cache v79):

- the header account button renders only for a device that still holds a
  session from an earlier build (avatar → profile card with Sync now / Sign out);
- `/account` shows a short "Sign-in is not available yet" notice instead of the
  form; the route stays (it is preloaded offline and linked from nowhere else);
- the Event home has no "Account" tile.

Everything below describes the code paths that remain in place and come back
the moment the switch is flipped. Flip it in the same change set that makes
account creation available to attendees.

## What ships

- **`/account`** (quick tile on Home, not in the bottom nav): login and register
  forms when logged out; profile (display name, email), favorites sync status,
  "Sync now" and logout when logged in.
- **Identity = WordPress users.** `auth/register` creates a WP user (subscriber),
  `auth/login` returns the profile plus an opaque bearer token (30-day expiry,
  SHA-256-hashed server side). Same identity pool as 3ho.org.
- **Token storage**: Dexie (`solstice-auth` store inside the event-store DB pattern),
  survives restarts; `auth/logout` revokes server-side and clears locally.

## Favorites sync

- **Merge on login**: the server copy is downloaded and unioned into local favorites
  (never destructive on first sync from a fresh device).
- **Push with tombstones**: local deletions are recorded in a `favoriteTombstones`
  Dexie table (db v3); sync sends upserts for current favorites and `deleted: true`
  for tombstones. The server resolves with last-write-wins per record
  (`{prefix}ssa_agenda_item`).
- **Triggers**: after login, on demand ("Sync now"), and debounced after favorite
  changes while logged in and online. Failures are silent-retry on next trigger —
  offline behavior is unchanged.

## Backend base URL

`src/lib/backend.ts` — single source for the API origin: a local override
(persisted in `localStorage`, shared with `/sync-lab`) falling back to the
production origin (`https://www.3ho.org`).

## Limitations (v1, documented on purpose)

- Only favorites for the **built-in event** sync (`summer-solstice-2026`): the local
  favorites store does not yet record which event an activity belongs to, and agenda
  rows are event-scoped server-side. Synced-event favorites remain device-local.
- No password reset flow yet (WordPress's standard reset works via the website).
- Profile editing (photo, timezone) deferred to the native phase.
