# WSOL26 — Trello card export

One card per workstream from [WSOL26-PLAN.md](WSOL26-PLAN.md). For each card below:
copy the **Title** into the card name, the **Description** block into the card
description, and add each checklist as a Trello checklist with the listed items.

Tip: pasting the seven title lines below into Trello's "Add a card" box (multi-line
paste) creates the seven cards at once; then fill each one.

```
WS1 · Runtime content sync — P0 · App
WS2 · Per-event Info Hub & venue map — P0 · App/Backend/Content
WS3 · Announcements & alerts in the app — P0 · App
WS4 · Store readiness (Apple & Google) — P0 · Ops
WS5 · Backend QA & production deploy — P0 · Backend/Ops
WS6 · Favorites sync for synced events — P1 · App
WS7 · WSOL26 content — P0 · Content
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

**Title:** WS3 · Announcements & alerts in the app — P0 · App

**Description:**
The server side is live: staff already publish official Announcements and urgent
Alerts from wp-admin, with a cheap polling API. The app just can't display them yet.
Design ready in docs/MESSAGING.md. Done when a staff post in wp-admin is readable in
the app within the polling interval.

**Checklist — Tasks:**
- Feed UI: announcements + alerts for the active event, newest first, offline-readable once fetched
- Background polling agent on GET /updates (app start + periodic) with unread badge on the nav
- Notification permission requested in context (first useful moment), never at first launch
- (P1) Server-side push delivery: real APNs/FCM sending on the broadcast hook — only if polling proves insufficient

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
- App Store privacy labels + Play data-safety form (optional accounts, favorites sync, push tokens)
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
