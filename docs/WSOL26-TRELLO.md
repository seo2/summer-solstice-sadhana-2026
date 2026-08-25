# WSOL26 — Trello card export

One card per workstream from [WSOL26-PLAN.md](WSOL26-PLAN.md). For each card below:
copy the **Title** into the card name, the **Description** block into the card
description, and add each checklist as a Trello checklist with the listed items.

## Batch import (recommended: the API script)

Trello has no generic built-in CSV importer; the ways to create these cards in batch:

1. **API script (full fidelity, nothing to install)** — creates the list, all cards
   with descriptions, and every checklist in one run. The card data lives in
   [`scripts/wsol26-trello-cards.json`](../scripts/wsol26-trello-cards.json) (kept in
   sync with this doc).

   ```bash
   # Preview what will be created (no credentials needed):
   npm run trello-import -- --board X --dry-run
   ```

   ```bash
   # Real run — get an API key at https://trello.com/power-ups/admin and a token
   # from the link next to it; set them as env vars (never commit or share them).
   export TRELLO_KEY=your_key TRELLO_TOKEN=your_token
   # Don't know the board's short link? Run without --board to list your boards:
   npm run trello-import
   # Then import into the chosen board:
   npm run trello-import -- --board <shortLink>
   ```

2. **Multi-line paste (native, titles only)** — paste the title block below into
   "Add a card"; Trello offers to create one card per line. Descriptions and
   checklists must then be filled by hand from this doc.
3. **Power-Ups** — third-party importers (e.g. the free "Kanban Importer", Excelefy,
   Blue Cat) can import CSV/Excel including checklists, if you prefer a UI over the
   script.

Tip: pasting the nine title lines below into Trello's "Add a card" box (multi-line
paste) creates the nine cards at once; then fill each one.

```
WS1 · Runtime content sync — P0 · App
WS2 · Per-event Info Hub & venue map — P0 · App/Backend/Content
WS3 · Notifications: announcements, alerts & push — P0 · App/Backend
WS4 · Store readiness (Apple & Google) — P0 · Ops
WS5 · Backend QA & production deploy — P0 · Backend/Ops
WS6 · Favorites sync for synced events — P1 · App
WS7 · WSOL26 content — P0 · Content
WS8 · Menus & nutrition — P1 · App/Backend/Content
WS9 · Messaging: work-team channels, groups & DMs — P1 · App/Backend
```

---

## Card 1

**Title:** WS1 · Runtime content sync — P0 · App

**Description:**
Make internet updates real: today fresh content only reaches users baked into an app
build or via the internal Sync Lab. After this card, a schedule change published in
WordPress appears on attendees' phones within minutes, automatically, and survives
offline. Must stay "mirror-ready" for the summer-2027 camp server (same REST
contract, single configurable backend origin, no absolute photo URLs baked in).
Event: Winter Solstice 2026, Dec 15–21, Lake Wales FL.

**Checklist — Tasks:**
- UpdateAgent: auto-refresh the active event's bundle (ETag/updated_since) on app start + periodically; save to the local event store
- Update UX: quiet "program updated" indicator, silent apply, never blocks offline reading
- Checkout feed → WordPress import automated (WordPress = single source of truth; no app rebuilds for content changes)
- Cache remote teacher photos at sync time (today only same-origin images work offline)

**Checklist — Mirror-ready constraints (design, verify before closing):**
- All sync through one configurable backend origin
- Media URLs relocatable (relative paths or local caching — no hardcoded 3ho.org URLs)
- Bundle versions monotonic per event; store-and-forward reconciliation
- Local-server discovery/failover explicitly deferred to 2027

---

## Card 2

**Title:** WS2 · Per-event Info Hub & venue map — P0 · App/Backend/Content

**Description:**
Known gap: synced events get program/teachers/favorites, but Info Hub, camp map, and
Women's Renewal are static Summer Solstice content — a WSOL26 attendee opening "Info"
today would read about Ram Das Puri (New Mexico). Done when a WSOL26 attendee reads
Florida arrival/camp-life info and sees the Florida venue map, fully offline.

**Checklist — Tasks:**
- Backend: per-event info pages included in the sync bundle
- App: render synced info pages with the existing section-card UI, offline
- Florida venue map image (Retreats By The Lake) served per event
- Point the zoomable map viewer at the active event's map
- Decide + implement behavior of SSOL-only sections (e.g. Women's Renewal) while WSOL26 is active

---

## Card 3

**Title:** WS3 · Notifications: announcements, alerts & push — P0 · App/Backend

**Description:**
Implements the full notification model: (N1) future-event news pushed to everyone
with the app installed (needs anonymous device registration — today tokens register
only after sign-in); (N2) personal notifications for favorites/agenda per event —
session reminders are already built (local, 15 min before), and change alerts fire
on-device when a sync changes a favorited session; (N3) official announcements +
urgent alerts during the event, with real push so alerts reach closed apps. The
announcements/alerts server side is live; design in docs/MESSAGING.md.

**Checklist — In-app feed (N3):**
- Feed UI: announcements + alerts for the active event, newest first, offline-readable once fetched
- Background polling agent on GET /updates (app start + periodic) with unread badge on the nav

**Checklist — Push infrastructure (N1 + N3):**
- Anonymous device registration: register push token once permission is granted, account or not; backend devices endpoint accepts account-less registrations
- Notification preferences in the app: "News about future events" + "Event alerts" toggles, stored with the registration
- Server-side push delivery (P0): real APNs/FCM on the broadcast hook, with audience model — event devices (alerts) vs all opted-in devices (future-event news) — sent from the wp-admin publisher
- Notification permission requested in context (first useful moment), never at first launch

**Checklist — Personal notifications (N2):**
- Favorited-session change alerts: on each bundle refresh (WS1 UpdateAgent), diff favorited sessions and fire a local notification on time/venue/cancellation changes — works logged-out, no per-user server targeting
- (Already built, verify in QA) Local reminders 15 min before each favorited session

---

## Card 4

**Title:** WS4 · Store readiness (Apple & Google) — P0 · Ops

**Description:**
Longest external lead times (account approvals, Apple review) — start immediately;
nothing here depends on app code. All records must use the new app id
**org.threeho.eventapp** (decision D5). Goal: both apps live by **November 24**
(3 weeks pre-event) so attendees install before traveling.

**Checklist — Apple:**
- Signing identities + APNs key + Push capability on org.threeho.eventapp
- App Store Connect app record ("3HO Event App")
- TestFlight group with internal testers receiving builds

**Checklist — Google:**
- Play Console app record
- Firebase project + google-services.json in the Android project (FCM)
- Internal-track build installs from Play

**Checklist — Assets & compliance:**
- Real 1024 px icon artwork (current one is an upscale) + regenerate icons/splashes with @capacitor/assets
- Public privacy policy URL
- App Store privacy labels + Play data-safety form (optional accounts, favorites sync, push tokens incl. anonymous device registration)
- Future-event news pushes documented as opt-in (in-app toggle) — marketing pushes without consent are a store-rejection reason
- Review notes: link-out ticket sales, no in-app purchases

**Checklist — QA & submission:**
- On-device QA, iPhone: install, airplane-mode cold start, agenda reminders, push registration, favorites sync
- On-device QA, Android: same pass
- Submissions sent early November
- Both apps publicly live by Nov 24

---

## Card 5

**Title:** WS5 · Backend QA & production deploy — P0 · Backend/Ops

**Description:**
The 3ho-solstice-app plugin (v0.4.0: auth, sync, devices, announcements) works in dev
but was never production-hardened or deployed, and the WSOL26 event doesn't exist in
production yet. Done when the app syncs the WSOL26 bundle from production 3ho.org.

**Checklist — Tasks:**
- php -l on the new plugin classes (messages/admin/schema)
- Verify DB v2 auto-migration on a fresh wp-admin load
- Post a test announcement; confirm GET /updates returns it
- Commit plugin v0.4.0 in the 3ho.org repo (repo owner) and deploy to production
- Production hardening: CORS allowlist (web + Capacitor origins), rate limits, token expiry
- Create + publish the WSOL26 event in wp-admin (Dec 15–21, Retreats By The Lake) and seed content as it lands

---

## Card 6

**Title:** WS6 · Favorites sync for synced events — P1 · App

**Description:**
Today only the built-in event's favorites sync across devices (the v1 store didn't
record which event a favorite belongs to). Favorites, agenda, and reminders already
work locally for synced events — this card is only the cross-device copy. Done when a
WSOL26 favorite marked on one phone appears on the same account's other phone.

**Checklist — Tasks:**
- Record the event for each favorite in the local store
- Push/pull favorites per event (server contract already carries the event field)
- Merge-on-login + tombstoned deletions working for synced events

---

## Card 7

**Title:** WS7 · WSOL26 content — P0 · Content

**Description:**
The app can only be as good as what's loaded into it — and the WSOL26 feed is live
but **empty (0 program items)** as of Aug 25. Terminology must be preserved exactly:
WTY®, White Tantric Yoga®, Sadhana, Gurdwara.

**Checklist — Tasks:**
- Teacher & Musician program finalized in the checkout platform / WordPress (feed currently empty)
- Teacher bios written — 33 of 34 still empty ("About" appears automatically once a bio exists)
- WSOL26 arrival/camp-life info texts (feeds WS2)
- Florida venue map artwork (feeds WS2)
- Full on-device read-through before content freeze

---

## Card 8

**Title:** WS8 · Menus & nutrition — P1 · App/Backend/Content

**Description:**
Daily food menus plus nutrition / yogi-diet guidance, alongside the existing content
(event info, program + detail, teachers, contact). Pulled forward from the Phase 3
backlog by owner decision (Aug 25). Menus travel through the sync bundle, so this
does NOT gate store submission — content can land and change daily after the apps
are live. Done when an attendee checks tomorrow's breakfast with no signal.

**Checklist — Build:**
- Backend content model `menu_day`: per-event, per-day structured menus (meal → dishes + dietary notes like vegan/GF), editable in wp-admin, included in the bundle
- Menus UI: Home tile + Info entry, opens on today's meals, day navigation like the program's day strip, offline once synced
- Nutrition & yogi-diet guidance pages (rides the WS2 per-event info-pages machinery)

**Checklist — Content:**
- Real WSOL26 menus for Dec 15–21 with dietary notes (kitchen/production team)
- Guidance texts written and reviewed
- Verified on device, offline

---

## Card 9

**Title:** WS9 · Messaging: work-team channels, groups & DMs — P1 · App/Backend

**Description:**
People can message each other, create groups, and work-team (seva) leaders can
create channels, add members, and post daily tasks, announcements, and meetings.
Design ready in docs/MESSAGING.md (polling-first); server schema already has
channel/member/message tables with broadcast endpoints live. Messaging requires
sign-in; the rest of the app stays account-free. Phased to protect Dec 15: 9a
(work-team channels) is the critical piece; 9b/9c ship only if the schedule holds,
else in the first post-event update. If messaging is in the store build, UGC
moderation (report/block/moderate + community rules) is mandatory for Apple/Google
review.

**Checklist — 9a · Work-team channels (build first):**
- Server: channel membership + member-posting endpoints on the existing schema
- Leader tools: create channel, add/remove members by account
- App: channel list + conversation view riding the WS3 polling agent
- Verified: a leader posts the day's tasks and the team reads them on their phones

**Checklist — 9b/9c · Groups & DMs (if schedule holds):**
- User-created groups with invites and member management (same conversation UI)
- Direct messages as two-member channels
- Attendee search with opt-in discoverability (nobody searchable by default)

**Checklist — UGC safety (store-required before submitting with messaging):**
- Report a message / report a user
- Block a user
- Staff moderation view: hide/remove content, suspend accounts
- Community rules accepted before first use of messaging
