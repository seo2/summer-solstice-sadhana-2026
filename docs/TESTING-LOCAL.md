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

### A full dummy event (`wsol26`)

`mocktest` is deliberately tiny — one session, for exercising change alerts. To
see the app carrying a realistic event, use the fixture instead:

`/sync-lab` → base `http://localhost:3999`, event slug **`wsol26`** → Fetch
bundle → Use this event in the app. That loads 47 sessions across 7 days, 6
teachers, 6 venues, 8 categories, 6 info pages, 19 menu entries and a venue map.

The fixture lives at `scripts/fixtures/wsol26.json` and is re-read on every
request: edit it, bump its `version`, re-fetch, and the app treats it as an
update. Any `scripts/fixtures/<slug>.json` is served the same way. See
[CONTENT-MODEL.md](CONTENT-MODEL.md).

## Level C — App + real WordPress (plugin v0.5.0)

The plugin lives in the 3ho.org repo (network volume). **State as of
2026-08-28**: the plugin is ACTIVE locally, DB v3 migrated, and two events are
seeded — `summer-solstice-2026` (full content, 34 info pages) and
`winter-solstice-2025` (test event with menus, a venue map, one announcement,
one alert, and `feed_slug=wsol26` for the P4 pipeline).

`https://3ho.test` currently hangs on port 443 (nginx listens but never
answers) — instead of touching that setup, serve WordPress with its built-in
server:

```bash
cd "/Volumes/3HO/99 - Sites/3ho" && wp server --host=127.0.0.1 --port=8080
```

Then in the app (`npm run dev -- -p 3011`): /sync-lab → base URL
`http://127.0.0.1:8080` → fetch `winter-solstice-2025` → activate from Home.
The override persists (localStorage) and every agent (UpdateAgent,
AlertsAgent, accounts, devices) uses it via `src/lib/backend.ts`.

Useful loops:

- Edit content in wp-admin — the local admin lives under the same server:
  http://127.0.0.1:8080/wp-admin → Event App menu (Program, Menus,
  Announcements, Events with map + feed fields). Every save bumps
  `content_version`; the app picks it up on the next tick or reload.
- Seed from CLI: `wp ssa seed --dir=wp-content/plugins/3ho-solstice-app/seeds/<dir> --event=<slug>`.
- Feed pipeline: Events screen → "Sync feed now" (hash-gated; re-running with
  no feed change reports "Feed unchanged").

CORS: the plugin allowlist includes `http://localhost:<any port>` and the
Capacitor origins. The full v0.5.0 owner-QA checklist is in the 3ho.org repo's
`CHANGELOG.md`. Verified end-to-end 2026-08-28: sync bundle with
menus/mapImage, `/updates` badge → announcements feed, anonymous
`POST /devices` (row lands with prefs/event/app_version), and P4 against the
production checkout feed (second run: "Feed unchanged").

## Level D — Native apps (simulator)

```bash
npm run cap:sync:dev    # test build: reveals the Sync Lab entry
npx cap open ios        # or: npx cap open android
```

Use **`cap:sync:dev`**, not `cap:sync`, for anything that needs a backend. Sync
Lab is unlinked from the app on purpose and the native shell has no address bar,
so a plain build gives you no way to point the app at a local backend or pull an
event into it. `cap:sync:dev` sets `NEXT_PUBLIC_SHOW_SYNC_LAB=1`, which adds an
"Internal build → Sync Lab" block at the bottom of the **Account** screen
(reached from the avatar in the header). Store builds leave the flag unset and
the block does not exist in the export — verify with
`grep -c "Sync Lab" out/account.html` (0 for a store build, 1 for a test build).

### Toolchain notes (verified 2026-09-01)

Both prototypes build and run headlessly, no IDE needed:

```bash
# iOS — build, install, launch, screenshot
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -derivedDataPath /tmp/ios-dd CODE_SIGNING_ALLOWED=NO build
xcrun simctl install booted /tmp/ios-dd/Build/Products/Debug-iphonesimulator/App.app
xcrun simctl launch booted org.threeho.eventapp
xcrun simctl io booted screenshot shot.png

# Android — needs JDK 17+; the system java may be older
printf 'sdk.dir=%s/Library/Android/sdk\n' "$HOME" > android/local.properties
cd android && JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n org.threeho.eventapp/.MainActivity
adb exec-out screencap -p > shot.png
```

Gotchas that cost time the first run:

- **`local.properties` is gitignored** — regenerate it per machine (line above).
- The repo's `java` on PATH may be **JDK 16**; AGP 8.13 needs 17+. Point
  `JAVA_HOME` at Android Studio's bundled JBR 21 rather than installing another
  JDK.
- **No WebView DevTools on Android**: Capacitor leaves
  `webContentsDebuggingEnabled` off, so there is no `webview_devtools_remote`
  socket to attach Chrome to. Debug from `adb logcat` and screenshots, or turn
  the flag on for debug builds only.
- The **Android emulator blocks cleartext HTTP** (no `usesCleartextTraffic`, no
  network-security config), so `http://10.0.2.2:3999` to the mock backend fails
  from the app. The iOS simulator can use `https://3ho.test` directly.
- Booting the emulator while Gradle compiles can wedge SystemUI
  ("System UI isn't responding") — `adb reboot` and wait for
  `sys.boot_completed`.
- **`adb logcat` first, screenshots second**: the Android crash loop found on
  this run was invisible in screenshots (the app simply returned to the
  launcher) and obvious in logcat as `FATAL EXCEPTION: CapacitorPlugins`.

- The native shells embed the **static build** (cap:sync rebuilds it) — they do
  not load the dev server.
- Backend base: Account → Sync Lab inside the app (test build only, above). The
  **iOS simulator** resolves `https://3ho.test` (it uses the host's DNS). The
  **Android emulator** does not resolve `.test` — use the machine's LAN IP, or
  `http://10.0.2.2:3999` for the mock backend. Debug builds carry
  `android/app/src/debug/AndroidManifest.xml`, which allows cleartext HTTP so
  those plain-HTTP backends are reachable; release builds do not.
- Loading a dummy event on a device is a **per-install** action: each app has
  its own WebView storage, so syncing an event in the browser or on iOS does
  nothing for the Android app. Every install pulls its own copy.
- Visible only on native: agenda reminders (15 min before a favorite) and the
  immediate "Schedule change" notifications — both work in the iOS simulator.
  **Real push delivery does not** (APNs needs a physical device + keys — WS4).

## What cannot be tested locally

Store installs, push delivery end-to-end (APNs/FCM), and review-facing flows —
all WS4, on physical devices.
