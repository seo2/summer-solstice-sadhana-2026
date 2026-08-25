# Handoff — continuing this project in Claude Code

_Written 2026-08-25. Read this together with `CLAUDE.md` (working rules) and
`docs/INDEX.md` (all docs). `docs/PROJECT-MEMORY.md` holds the decision log._

## The two repositories

| Repo | Path | Role | Git discipline |
|---|---|---|---|
| **App** (this repo) | `~/htdocs/summer-solstice-sadhana-2026` | Next.js 15.5 PWA + Capacitor native shells | Branch per change set → validate → merge to `main` → push. Rules in `CLAUDE.md` |
| **3ho.org WordPress** | `/Volumes/3HO/99 - Sites/3ho` (network volume — may need remounting) | Backend plugin `wp-content/plugins/3ho-solstice-app/` + site blocks/shortcodes | **Different rules** (`AGENTS.md` there): propose before coding, **never commit/push unless explicitly asked**, update its `CHANGELOG.md` per change |

## State at handoff

### App repo — `main` @ `03cb6e7`, pushed, offline cache **v57**

Everything below is merged and on GitHub:

- **Checkout-feed content pipeline** (2026-08-05): `npm run pull-program`
  (`scripts/pull-program.mjs`) imports the published Teacher & Musician program
  from the checkout platform
  (`{register.3ho.org}/wp-json/wsol/v1/presenter/bundle?event=wsol26`).
  Mixed-source merge: only `presenter-*` entries belong to the feed (replaced
  wholesale, stable ids so favorites survive reschedules); teachers enriched by
  `facilitatorNames`; photos downloaded to `public/images/teachers/`. Flags:
  `--base`, `--event`, `--dry-run`, `--insecure`. Docs in `docs/TEACHERS.md`.
  **Phase 2 of this pipeline (runtime sync against the same endpoint) is pending.**

- Offline-first PWA core (program ×125 with detail pages, favorites/agenda in
  Dexie, Info Hub, zoomable map, contact form with outbox).
- **Teachers**: `/teachers` grid + `/teachers/[id]` profiles + quick-view modal from
  program cards/detail; favorite toggles on sessions everywhere. Data:
  `src/data/teachers.json`, linked by `facilitatorNames` (33 of 34 bios still empty).
- **Program advanced filters** (per `design/program-style-guide.html` §03).
- **Sync client v1**: `/sync-lab` (internal, unlinked) fetches the WordPress bundle;
  fetched events are stored locally (`solstice-event-store` Dexie DB) and render in
  the **full app views**; "Your events" switcher on Home; "Viewing event" banner.
- **Accounts** (`docs/ACCOUNTS.md`): WordPress identity, `/account` UI, header
  avatar button, username-or-email login, password-reset link, cross-device
  favorites sync (merge-on-login + tombstones + LWW; **v1 limit: built-in event
  favorites only**).
- **Native (Phase 2)**: `ios/` + `android/` committed (Capacitor 8, SPM),
  appId `org.threeho.summersolstice2026`; agenda reminders 15 min before favorited
  sessions (ReminderAgent, native-only); push registration groundwork (PushAgent →
  `devices` endpoint, iOS AppDelegate handlers); brand asset sources in `assets/`.

### WordPress repo — plugin v0.4.0, **all changes uncommitted** (by that repo's rules)

- REST under `3ho-solstice/v1`: `auth/*` (opaque bearer tokens), `sync` (versioned
  bundle + agenda push), `devices`, and **messaging 3a**: `channels`,
  `channels/{id}/messages?since=`, combined `updates` poll. Public-read broadcasts;
  staff-only posting; `threeho_ssa_broadcast_posted` hook for future push delivery.
- Multi-event MySQL schema `{prefix}ssa_*` (DB v2 adds channel/member/message).
- wp-admin **Solstice App** menu: Program (with day/category/location/facilitator
  filters), Teachers, Events CRUD, Import (JSON upsert + dry run), Announcements,
  Settings. Media Library picker for photos.
- Website **blocks + shortcodes** (`[ssa_program]`, `[ssa_teachers]`) rendering from
  the DB with the app design system (`assets/solstice-app.css` scoped `.ssa-app`),
  teacher modal, sticky filter header + day headers, scrollspy day pills, advanced
  filters, description clamping. Site typography (Barlow Semi Condensed / Arimo).
- Seeds: `seeds/summer-solstice-2026/` (full app content) and
  `seeds/winter-solstice-2025/` (test event). `wp ssa seed --dir=… [--event= --name=
  --location= --timezone=]`.

### Immediate pending / QA gaps

1. **WordPress repo**: run `php -l` on `includes/class-ssa-messages.php`,
   `class-ssa-admin.php`, `class-ssa-schema.php` (written without a working shell);
   reload wp-admin (DB v2 auto-migrates); post an announcement; verify
   `GET /updates`. Then the user commits when satisfied.
2. **App next feature**: messaging feed UI + `/updates` polling agent (design ready
   in `docs/MESSAGING.md`, server live).
3. **Native ops** (user/Apple/Google): APNs key + Push capability, Firebase +
   `google-services.json`, Xcode/Android Studio QA, real 1024px icon art
   (replace `assets/icon.png`), store listings.
4. Teacher bios content (33 pending); `docs/LOCAL-NETWORK.md` tiered decision
   (proxy-cache first, WP mirror later — discussed, not yet written).

## Working knowledge that saves time

- **Offline cache rule** (the most important habit): any visible change bumps the
  version in BOTH `src/components/offline-preloader.tsx` (3 constants) and
  `next.config.ts` (`OFFLINE_CACHE`). Currently **v57**.
- Validate for real: `npm run typecheck && npm run lint && npm run build`; verify
  flat `out/*.html` (routes export as `out/map.html`, not `out/map/index.html`).
- Backend base URL for dev: set it in `/sync-lab` (persists in localStorage; shared
  by accounts via `src/lib/backend.ts`). Production default `https://www.3ho.org`.
- Plugin CORS allows `http://localhost:<any-port>` and Capacitor origins.
- Teachers link to program by **exact facilitator string** (`facilitatorNames`).
- Photos policy: WordPress Media Library URLs; app-relative paths from seeds resolve
  via the legacy media base URL (Solstice App → Settings).
- The website CSS defends against theme/Bootstrap `<button>` styling with
  `!important` (documented exception); `.ssa-app` caps width at 48rem — overlays
  must override it (see `.ssa-app.ssa-modal-overlay`).
- All frontend work follows the in-repo **`design/`** folder (tokens, program style
  guide, teachers prototype). UI copy is English; conversation may be Spanish.
- Cross-origin teacher photos are not yet precached offline (preloader only warms
  same-origin `/images/…`) — address when hardening the sync client.

## Suggested first session in Claude Code

```bash
cd ~/htdocs/summer-solstice-sadhana-2026
git status && git log --oneline -5     # expect 03cb6e7 at HEAD, clean tree
npm run typecheck && npm run lint && npm run build
npm run dev -- -p 3011                 # http://localhost:3011 (+ /sync-lab)
```

Then pick up one of: app-side messaging feed (`docs/MESSAGING.md`, server live),
checkout-feed runtime sync (phase 2 of `pull-program`), or native QA/push ops.
