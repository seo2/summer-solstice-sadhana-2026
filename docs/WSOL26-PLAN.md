# WSOL26 Plan — Winter Solstice 2026 (Florida)

Feature and task list for the next stage: shipping the native iOS/Android app for
**Winter Solstice 2026 (WSOL26)**. Prepared 2026-08-25 for planning and stakeholder
review. Companion to [REQUIREMENTS.md](REQUIREMENTS.md) (what exists today) and
[HANDOFF.md](HANDOFF.md) (state of both repos).

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

## Decisions needed first (they gate the scope)

| # | Decision | Recommendation |
|---|---|---|
| D1 | **How WSOL26 ships in the app**: (a) same app, WSOL26 served through the multi-event machinery, or (b) a separate WSOL26 build | (a) — the machinery exists; one app, one store listing, one codebase |
| D2 | **App name/branding for the stores** (if D1 = a): the shell is branded "Summer Solstice Sadhana 2026" | Rename to a neutral, durable name (e.g. "3HO Solstice") before first store submission — renaming after launch is costly |
| D3 | **Content source of truth for WSOL26**: checkout feed direct-to-app vs everything through WordPress | Single source = WordPress DB. Import the checkout feed into WP (Import screen / CLI exist); the app syncs only from the WP bundle |
| D4 | **Exact WSOL26 dates + content owners** (program, info pages, venue map, teacher bios) | Confirm with the event team — drives the timeline below |

## Workstreams

### WS1 — Runtime content sync (P0 · app)

The piece that makes internet updates real. Today content only ships baked into the
build or via the internal Sync Lab.

- [ ] **UpdateAgent**: background refresh of the active event's versioned bundle
      (ETag / `updated_since`) on app start and periodically while open — productize
      the Sync Lab client.
- [ ] Update UX: unobtrusive "program updated" indicator; silent apply; never
      interrupt offline use.
- [ ] Implement D3 pipeline: WSOL26 program/teachers land in WordPress
      (automate checkout-feed → WP import if D3 = WordPress).
- [ ] **Offline photos for synced events**: cache remote teacher photos
      (the preloader currently only warms same-origin `/images/…`).

### WS2 — Per-event Info Hub & venue map (P0 · app + backend + content)

**Known gap**: synced events render program/teachers/favorites, but the Info Hub,
camp map, and Women's Renewal pages are static Summer Solstice 2026 content. WSOL26
needs its own:

- [ ] Info pages per event in the sync bundle (backend: content type + bundle field;
      app: render synced info pages offline).
- [ ] Florida venue map asset; reuse the zoomable viewer with a per-event image.
- [ ] Decide what SSOL-specific sections (e.g. Women's Renewal) show or hide when
      WSOL26 is active.

### WS3 — Announcements & alerts, app side (P0 · app; server is live)

- [ ] Feed UI for official Announcements + urgent Alerts (design ready in
      [MESSAGING.md](MESSAGING.md)).
- [ ] Background polling agent on the cheap `GET /updates` endpoint; unread badge.
- [ ] Notification permission requested in context (first alert interaction, not at
      first launch — also a store-review point).
- [ ] Push delivery server-side (APNs/FCM sending on the existing
      `threeho_ssa_broadcast_posted` hook) — P1 if polling proves sufficient for
      Florida connectivity.

### WS4 — Store readiness / native ops (P0 · ops — longest lead times, start now)

- [ ] Apple Developer account ready: signing identities, **APNs key**, Push
      capability; App Store Connect listing; TestFlight beta group.
- [ ] Google Play Console; **Firebase project + `google-services.json`** (FCM).
- [ ] Final **1024 px icon artwork** (current asset is an upscale — must be replaced)
      + splash screens via `@capacitor/assets`.
- [ ] On-device QA passes (iPhone + Android): install, offline cold start, reminders,
      push registration, sign-in.
- [ ] Privacy policy URL, data-safety/privacy forms, review notes (optional accounts,
      link-out commerce, no in-app payments).
- [ ] Submit with buffer for review cycles (target: apps live ≥3 weeks before the event).

### WS5 — Backend QA & production deploy (P0 · backend + ops)

- [ ] Pending QA from [HANDOFF.md](HANDOFF.md): `php -l` on the new plugin classes,
      DB v2 auto-migration check, post a test announcement, verify `GET /updates`.
- [ ] Commit plugin v0.4.0 in the 3ho.org repo (owner does this, per that repo's rules),
      then deploy to production 3ho.org.
- [ ] Production hardening: CORS allowlist for app origins, rate limits sanity check,
      token expiry behavior.
- [ ] Create and publish the **WSOL26 event** (Events CRUD) and seed its content.

### WS6 — Accounts & favorites for synced events (P1 · app)

- [ ] **Multi-event favorites sync**: v1 only syncs the built-in event's favorites.
      If D1 = (a), WSOL26 favorites must sync cross-device too (local favorites,
      agenda and reminders already work for synced events).

### WS7 — Content (parallel · content team)

- [ ] WSOL26 program & teachers finalized in the checkout platform / WordPress.
- [ ] Teacher bios (33 of 34 still empty — applies to both events).
- [ ] WSOL26 info-hub texts and Florida venue map artwork.
- [ ] Content QA on device (terminology exactly as provided: WTY®, White Tantric
      Yoga®, Sadhana, Gurdwara).

## Suggested timeline (assuming WSOL26 in late December — confirm D4)

| When | Milestone |
|---|---|
| **September** | D1–D4 decided · store/Firebase/APNs accounts moving (WS4 started) · backend QA done + plugin deployed (WS5) · WS1 development underway |
| **October** | WS1 + WS3 feature-complete · WS2 built · TestFlight / internal Android testing with real WSOL26 content |
| **November** | WS6 · store submissions with review buffer · on-device QA · content complete (WS7) |
| **December** | Content freeze · apps live ≥3 weeks pre-event · event ops (staff publish announcements/alerts) |

## Out of scope for this stage

- Camp local network / edge server (summer 2027, Ram Das Puri — R&D per
  [LOCAL-NETWORK.md](LOCAL-NETWORK.md)); note WS1's UpdateAgent should keep the
  backend base URL swappable so the 2027 local server slots in without client changes.
- Group chats / direct messages (messaging phases 3b/3c).
- Home-screen widget, lock-screen "up next".
- Commerce beyond the link-out decision; daily menus / yogi diet content.
