# Native apps (iOS + Android)

Plan for shipping real native apps from the existing web build using Capacitor.

> Status: **platforms added** (2026-07-19). `ios/` and `android/` are scaffolded and
> committed (`npx cap add`, Capacitor 8 with Swift Package Manager on iOS — no
> CocoaPods needed), `npx cap sync` copies the `out/` build. App id is
> `org.threeho.summersolstice2026` (Android package segments cannot start with a
> digit, hence "threeho"). **Local notifications are wired**: a native-only
> ReminderAgent schedules a reminder 15 minutes before each favorited session
> (built-in + active synced event), rescheduling on every favorites change.
> Pending: run/QA in Xcode & Android Studio, icons/splash, push, widget.

## Approach

Capacitor wraps the static web export (`out/`) in a native shell. The web app stays the
single source of UI; native code is added only for capabilities the web layer cannot
provide (push, widgets, lock-screen presence, store integration).

```bash
npm run build          # produces out/
npx cap add ios
npx cap add android
npx cap sync           # or: npm run cap:sync
npx cap open ios       # Xcode
npx cap open android   # Android Studio
```

## Capabilities and where they live

| Capability | Layer | Notes |
|---|---|---|
| Program / map / info / agenda | Web (existing) | Already works offline via service worker + IndexedDB |
| Local notifications (agenda reminders) | Capacitor plugin | `@capacitor/local-notifications`; a prep service exists at `src/lib/local-notifications.ts`, not yet wired to UI. Runs only in the native app, not the browser PWA |
| Push notifications | Capacitor + backend | `@capacitor/push-notifications`; register device token with backend ([BACKEND.md](BACKEND.md)); APNs (iOS) + FCM (Android) |
| Home-screen widget | **Native code** | iOS WidgetKit (SwiftUI) + Android App Widget — not expressible in Capacitor JS. Shares data with the web layer via App Groups (iOS) / shared storage (Android) |
| Lock-screen "up next" | **Native code** | iOS Live Activities / ActivityKit; Android ongoing/updating notification. Feeds from the synced agenda |
| Store presence | Native tooling | Xcode + App Store Connect; Android Studio + Play Console |

## Push notifications

- Device registers a push token on login (or first launch) and sends it to the backend
  `device` table.
- Server sends via APNs / FCM. For the MVP this is the WordPress backend calling APNs/FCM
  over HTTP from PHP (see [BACKEND.md](BACKEND.md)); FCM directly is also possible.
- **Offline caveat:** APNs/FCM require internet. At camp, push must fall back to the
  **local-network delivery** path (in-app realtime over LAN + locally scheduled
  notifications). See [LOCAL-NETWORK.md](LOCAL-NETWORK.md).

## Widget + lock-screen "up next"

Both surface the attendee's **next scheduled agenda item** (time, title, venue) without
opening the app.

- Source of truth: the local agenda, kept fresh by sync (cloud or local network).
- iOS: a WidgetKit widget + a Live Activity for the imminent item; data shared from the
  web layer through an App Group container.
- Android: an App Widget + an ongoing notification updated as the next item approaches.
- Requires a small native bridge to write the "next items" snapshot where the widget /
  activity extension can read it. Scope this as its own change set.

## Sequencing

1. Add platforms, verify the web build runs natively on both.
2. Wire local notifications to the agenda (works without a backend).
3. Add push once the backend + `device` registration exist (Phase 1).
4. Widget + lock-screen presence as a dedicated follow-up (needs native modules).

## Open decisions

- Bundle IDs / app names / signing identities and 3HO developer accounts.
- Push provider path (FCM direct vs via backend platform).
- How aggressively to schedule agenda reminders by default (battery vs usefulness).
