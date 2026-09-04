# Home — the app's front door, one level above the event

Two homes, in this order:

1. **App Home (`/`)** — every event 3HO publishes, the latest announcements
   for the event being viewed, and news & posts. Where the app opens.
2. **Event Home (`/event`)** — one event's own front door: its hero (built-in
   Summer Solstice artwork, or the synced event's name/dates/location) and the
   event's sections (Program, Teachers, Favorites, Info, Map, Contact,
   Account, Menus when published, the Women's Renewal promo for the built-in).
   Reached by opening an event on the App Home.

Until now `/` *was* the event home: the app opened straight into Summer
Solstice, other events only appeared once downloaded ("Your events"), and
there was no place for news that is not an urgent alert. Product owner
direction (2026-09-04): **the Home comes before the event's home — the app
must not open an event on Home.**

Status: **app side shipped** (cache v70). **Plugin side implemented 2026-09-04**
in the 3ho.org working tree as plugin **v0.6.0 / DB v4** (P5 below; that repo's
rule: the owner QAs and commits) and verified end-to-end against local
WordPress. Until it is deployed, production answers `GET /home` with 404 and
the App Home lists the built-in event alone, plus whatever events the device
has downloaded.

## App Home (`/`), top to bottom

| # | Section | Source | Hidden when |
|---|---|---|---|
| 1 | **Title block** — "3HO Event App · Sat Nam" + one line on what the app is | static | never |
| 2 | **Events** — the first entry is the Home's **hero**: deep-blue card with the event's cover as backdrop, phase + countdown badge ("Upcoming · In 102 days", "Happening now · Day 3 of 7", "Past event · Ended Jun 27"), display-size uppercase name, dates in orange, summary, white CTA (+ Register); the rest as compact rows with cover thumbnails | `home-feed.ts` catalog ∪ built-in ∪ locally synced (`HomeEvents`) | never (the built-in event is always there) |
| 3 | **Install hint** | existing | installed / native / dismissed |
| 4 | **Announcements** — two newest official/alert messages of the event being viewed, with that event's name | `messages.ts` local store (`HomeAnnouncements showEvent`) | no message stored for that event |
| 5 | **News & posts** — three newest visible posts; the first one in a magazine layout (full-width image, big title) when it has an image | `home-feed.ts` posts (`HomeNews`) | no visible post |

Every dynamic section reads from IndexedDB, so a fresh install with no
connectivity still sees a complete, calm Home. Design per `PRODUCT.md`: one
focal point — the featured event's hero reuses the event hero's own language
(deep blue, `solstice-title` display type, orange dates, white CTA) so the two
homes feel like one app — and white cards for everything else.

## Event Home (`/event`)

The former `/` content, unchanged in look: `ActiveEventBanner` (synced event →
"All events" link back to `/`), an "All events" back link for the built-in
event, the hero (`EventHero`, formerly `HomeHero`), the Women's Renewal promo
(`BuiltinOnly`), and the section tiles. It is in the offline preload list and
the navigation warm-up. The bottom bar's **Home** tab always leads to `/`.

## Events list

`mergeHomeEvents()` in [`src/lib/home-feed.ts`](../src/lib/home-feed.ts) builds
the list from three sources and de-duplicates by slug:

1. the **catalog** the backend published (`GET /home` → `events[]`);
2. the **built-in** Summer Solstice 2026 (`BUILTIN_HOME_EVENT`) — always
   present, never removable; catalog fields win when the backend lists it too;
3. any **locally synced** event the catalog no longer lists (a downloaded event
   never vanishes from the device just because it was unpublished).

Archived events (`status: "archived"`) are hidden. Order: **happening now**,
then **upcoming** (soonest first), then **past** (most recent first); within a
phase the **event being viewed comes first**, so "Continue" is one tap. The
phase is computed by calendar date on the device (`eventPhase()`).

Each entry shows the phase chip, name, dates, location, and — featured only —
the countdown (`eventCountdown()`), the summary and the cover as backdrop.
Actions:

- **Continue** (viewing now) → `/event` without changing anything;
- **Open event** when the bundle is on the device → activates it, then `/event`;
- **Download & open** otherwise → `GET /sync?event=<slug>` from the configured
  backend, store, pre-cache photos, activate, `/event`. Offline or unknown slug
  → "Needs a connection to download", nothing else changes;
- **Register** (link-out, `registrationUrl`) while the event is not past — per
  the Phase 5 decision the app never sells tickets itself;
- a **remove** icon on downloaded, inactive synced events (frees the bundle;
  the built-in event has none).

Opening records the choice as **manual** (`activateEvent()` in
[`src/lib/event-discovery.ts`](../src/lib/event-discovery.ts)), so background
adoption (`events/current`) never drags the attendee off the event they
picked — the rule the old "Your events" switcher followed. That switcher
(`event-switcher.tsx`) is gone; the list replaces it.

## Announcements digest

Pure read of the existing phase-3a feed (`useBroadcasts`) for the event being
viewed: two newest messages (alerts amber, announcements sky), the unread count
from the local read cursor, the event's name, and a link to `/announcements`.
No new polling — the `AlertsAgent` already keeps the store fresh. The digest
does **not** clear the unread badge; opening the feed does, as before.

## News & posts

A new content type: **posts** are staff-authored items that are not urgent
alerts — registration openings, travel notes, seva calls, save-the-dates,
thank-yous. Shape (`HomePost`):

| Field | Required | Notes |
|---|---|---|
| `id` | yes | stable string id |
| `title` | yes | |
| `body` | — | plain text in the **info-page grammar**: blank line = paragraph, a line starting with `∙ • — -` = bullet ([`plain-text.ts`](../src/lib/plain-text.ts)) |
| `image` | — | URL; pre-cached at fetch time for offline |
| `linkUrl`, `linkLabel` | — | one call to action, opens outside the app |
| `eventSlug` | — | **scope**: omit for everyone; set it to show the post only while that event is active |
| `pinned` | — | pinned posts sort first |
| `publishedAt` | — | ISO timestamp; newest first |

`visiblePosts(posts, activeSlug)` applies the scope rule: everyone's posts plus
the active event's own. The App Home shows three (`HomeNews`); **`/news`**
lists them all with a manual refresh; both open a post in a bottom sheet
(`PostSheet`) with the image, the parsed body and the link button. `/news` is
in the offline preload list.

## Backend contract — `GET /wp-json/3ho-solstice/v1/home`

Public, no auth, same CORS allowlist as `/sync`. One small response the app
fetches whole and replaces locally:

```json
{
  "ok": true,
  "generatedAt": "2026-09-04T12:00:00+00:00",
  "events": [
    {
      "slug": "wsol26",
      "name": "Winter Solstice Sadhana Celebration 2026",
      "startDate": "2026-12-15",
      "endDate": "2026-12-21",
      "location": "Retreats By The Lake, Lake Wales, FL",
      "timezone": "America/New_York",
      "status": "active",
      "summary": "Seven days by the lake in Florida…",
      "cover": "https://www.3ho.org/wp-content/uploads/…/wsol26-cover.jpg",
      "registrationUrl": "https://register.3ho.org/…",
      "version": 7
    }
  ],
  "posts": [
    {
      "id": "post-wsol26-registration-open",
      "title": "Winter Solstice 2026 registration is open",
      "body": "Join us December 15–21…\n\n∙ White Tantric Yoga® Dec 17–19\n∙ …",
      "image": "https://www.3ho.org/wp-content/uploads/…",
      "linkUrl": "https://register.3ho.org/…",
      "linkLabel": "Register now",
      "eventSlug": null,
      "pinned": true,
      "publishedAt": "2026-09-01T15:00:00+00:00"
    }
  ]
}
```

Rules the app relies on:

- `events[]` lists every event with `status = 'active'` (archived omitted; the
  app also filters them defensively), ordered by `start_date`. `slug` and
  `name` required; everything else optional. `version` is the event's
  `content_version`, informational.
- `posts[]` lists non-deleted posts, newest first; `id` and `title` required.
  `eventSlug` null/absent means "for everyone".
- Media URLs are **absolute** (Media Library) so the app can pre-cache them; a
  future camp mirror serves the same contract from its own origin (the
  LOCAL-NETWORK.md constraint already applied to bundle photos).
- Cheap by construction: a few KB; `ETag` / `If-None-Match` support is welcome
  but not required (the app fetches at most every 30 minutes while open).

### Client behaviour

- **Storage:** Dexie DB `solstice-home-feed` — tables `events` (by slug),
  `posts` (by id), `state` (`fetchedAt`). Each refresh replaces both tables in
  one transaction, so a post deleted in wp-admin disappears on the next fetch.
- **Refresh:** `HomeFeedAgent` — 10 s after start (staggered behind the bundle
  and alerts agents), when back online, when the tab becomes visible, every
  30 min while open. Silent on failure. `/news` has a manual refresh button.
- **Backend origin:** `getBackendBaseUrl()` — production 3ho.org, or the Sync
  Lab override for local testing.
- **Images:** covers and post images are warmed into the offline cache
  (`warmImageUrls`, shared with bundle photos).

## P5 — plugin side (3ho.org repo) — IMPLEMENTED 2026-09-04, pending owner QA + commit

Follows the pattern of P1–P4 in [BACKEND-WSOL26.md](BACKEND-WSOL26.md): proposed
here, implemented in the WordPress working tree (`includes/class-ssa-home.php`
new; `class-ssa-schema.php`, `class-ssa-admin.php`, the bootstrap, README and
that repo's `CHANGELOG.md` updated; `php -l` clean), QA'd and committed by the
owner. Verified locally: `plugins_loaded` migrated the DB to v4, `GET /home`
answers with events + posts, `ETag` + `If-None-Match` → 304, the Posts and
Events screens render with the new fields prefilled, and the app's Home lists
the real catalog and posts from local WordPress with the scope rule holding.

1. **Schema (DB v4)**
   - `ssa_event` gains `summary` VARCHAR(500) NULL, `cover_image` VARCHAR(500)
     NULL (Media Library URL, picker like `map_image`), `registration_url`
     VARCHAR(500) NULL.
   - New table `ssa_post`: `id` VARCHAR(191) PK · `event_id` BIGINT NULL
     (NULL = for everyone) · `title` VARCHAR(255) · `body` LONGTEXT ·
     `image` VARCHAR(500) NULL · `link_url` VARCHAR(500) NULL · `link_label`
     VARCHAR(80) NULL · `pinned` TINYINT(1) DEFAULT 0 · `published_at` DATETIME ·
     `updated_at` DATETIME · `deleted` TINYINT(1) DEFAULT 0.
2. **Admin** — an "Event App → Posts" screen (list, add/edit: title, body
   textarea with the grammar hint, image picker, link URL + label, scope select
   "Everyone / <event>", pinned, publish date; soft delete). The Events screen
   gains the three new fields.
3. **Route** — `GET /home` (public, `__return_true`, origin allowlist, its own
   rate-limit bucket) in a new `includes/class-ssa-home.php`, returning the
   shape above; posts join `ssa_event.slug` as `eventSlug`.
4. **No content-version coupling** — the home feed is independent of any
   event's `content_version`; nothing to bump.
5. **Optional later** — `ETag` on `/home`; a `threeho_ssa_post_published` hook
   for the push sender (a pinned post could become an opt-in "news" push, N1).

Owner QA: reload wp-admin (DB v4 auto-migrates), open Event App → Posts (two
QA posts were left there: `post-qa-registration-open` for everyone and
`post-qa-scoped-wsol25` scoped to Winter Solstice Test; delete or edit them),
create a post for everyone and one scoped to WSOL26;
`GET /home` returns both with the event catalog; the App Home shows the catalog
and the everyone-post while Summer Solstice is active, and both posts once
WSOL26 is opened; delete the post in wp-admin → gone from the app after the
next refresh.

## Testing locally

```bash
npm run mock-backend        # http://localhost:3999 — GET /home from scripts/fixtures/home.json
npm run dev -- -p 3011
```

Point the app at the mock once (`/sync-lab` → base `http://localhost:3999`; no
need to fetch anything — the adoption agent pulls `wsol26` by itself). Within
~10 s the App Home shows **Events** (Winter Solstice featured with cover and
Register, Summer Solstice as a past row), the mock **Announcements**, and
**News & posts** (pinned registration post first). Tap **Continue** → `/event`
shows the Winter Solstice hero and tiles; tap the Summer Solstice row on Home →
the built-in hero. Edit [`scripts/fixtures/home.json`](../scripts/fixtures/home.json)
— re-read on every request — and tap refresh on `/news`.
