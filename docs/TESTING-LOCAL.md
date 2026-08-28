# Testing the app locally

Three levels, from zero setup to the full stack. Commands assume the repo root.

## Level A — App alone (no backend)

Everything built-in works with no backend: program, favorites, reminders
(native), Info Hub, map, menus/announcements empty states.

```bash
npm run dev -- -p 3011
```

Open http://localhost:3011. To test the **offline** behavior for real, use a
production build (`npm run build && npx serve out`) — the service worker is
disabled in dev.

## Level B — App + mock backend (no WordPress needed)

`scripts/mock-backend.mjs` fakes the plugin's REST contract with a test event
("mocktest") that exercises the whole runtime-sync stack: bundle v1→v2 update,
favorited-session change alerts, announcements/alerts feed, per-event info
pages, venue map, and menus.

```bash
npm run mock-backend        # terminal 1 → http://localhost:3999
npm run dev -- -p 3011      # terminal 2
```

Walkthrough:

1. Open http://localhost:3011/sync-lab → base URL `http://localhost:3999`,
   event slug `mocktest` → **Fetch bundle** (saves v1 locally).
2. Home → "Your events" → tap **Mock Winter Solstice** to activate it.
3. Explore: Program (one session), **Info** (2 event pages), **Map** (Florida
   SVG with zoom), **Menus** (Home tile appears; day chips + meal cards).
4. **Change alert**: favorite "Morning Sadhana" (heart), then reload the page.
   ~8 s later the UpdateAgent pulls v2 (the session moves to 8:00 AM ·
   Lakeside Hall) and shows the specific toast; the Program reflects the move.
5. **Announcements**: the bell badge shows 2 within ~12 s; open the feed
   (alert amber + announcement white). Publish a new one and refresh the feed:

   ```bash
   curl "http://localhost:3999/mock/post?type=alert&body=Test%20alert"
   ```

6. Reset app state when done: DevTools → Application → Storage → Clear site
   data (or remove the event from Home's "Your events" and clear the base URL
   in /sync-lab).

## Level C — App + real WordPress (plugin v0.5.0)

The plugin lives in the 3ho.org repo (network volume) and runs locally at
`https://3ho.test`. One-time: reload wp-admin so the DB v3 migration runs.

1. In wp-admin (Solstice App menu): create/seed an event, add program items,
   post an Announcement, add Menus, set a Venue map image, and optionally set
   the event's **Checkout feed slug** + "Sync feed now" (P4).
2. In the app: /sync-lab → base URL `https://3ho.test` → fetch + activate.
   The override persists (localStorage) and every agent (UpdateAgent,
   AlertsAgent, accounts, devices) uses it via `src/lib/backend.ts`.
3. Edit content in wp-admin (`content_version` bumps on save) and watch the
   app pick it up on the next tick — or reload to trigger the boot tick.

CORS: the plugin allowlist includes `http://localhost:<any port>` and the
Capacitor origins. The full v0.5.0 owner-QA checklist is in the 3ho.org repo's
`CHANGELOG.md`.

## Level D — Native apps (simulator)

```bash
npm run cap:sync
npx cap open ios        # or: npx cap open android
```

- The native shells embed the **static build** (cap:sync rebuilds it) — they do
  not load the dev server.
- Backend base: open /sync-lab inside the simulator app. The **iOS simulator**
  resolves `https://3ho.test` (it uses the host's DNS). The **Android
  emulator** does not resolve `.test` — use the machine's LAN IP, or
  `http://10.0.2.2:3999` for the mock backend.
- Visible only on native: agenda reminders (15 min before a favorite) and the
  immediate "Schedule change" notifications — both work in the iOS simulator.
  **Real push delivery does not** (APNs needs a physical device + keys — WS4).

## What cannot be tested locally

Store installs, push delivery end-to-end (APNs/FCM), and review-facing flows —
all WS4, on physical devices.
