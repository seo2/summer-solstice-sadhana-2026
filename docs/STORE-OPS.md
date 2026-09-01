# Store Ops Runbook — WS4 (App Store + Google Play)

Step-by-step to get the **3HO Event App** live in both stores by **November 24,
2026** (3 weeks before WSOL26). Owner/ops tasks unless marked `[dev]`. Matches
the WS4 Trello card checklists. Prepared 2026-08-28.

## Technical state (already done)

- App id **`org.threeho.eventapp`** everywhere (immutable on Play once published).
- Display name "3HO Event App"; event-neutral shell + splash (cache v65).
- Brand asset sources sized correctly: `assets/icon.png` **1024×1024**,
  `assets/splash*.png` **2732×2732**. ⚠️ The icon is an **upscale** — replace
  with final art before generating store assets (quality, not size).
- Android manifest now declares `POST_NOTIFICATIONS` (required on Android 13+
  for reminders/push to display — was missing, fixed 2026-08-28).
- Versions: iOS `MARKETING_VERSION 1.0` / build 1 · Android `versionName 1.0` /
  `versionCode 1` — fine for first submission.
- Privacy policy drafted at the app route **`/privacy`** (linked from Account).
  ⚠️ Review the text with the organization before submitting, and decide the
  **public web domain** of the PWA (the policy URL you give the stores, e.g.
  `https://<final-domain>/privacy`).

## ⚠️ Blocker to schedule: in-app account deletion (G1)

Apple guideline 5.1.1(v): apps that offer **account creation must offer
in-app account deletion**. The app has in-app registration, so this is required
before iOS submission. Needs a small plugin endpoint (`auth/delete-account`)
plus a button in `/account` — ask the dev side to propose & build it (≈1 change
set per repo). The privacy policy's deletion paragraph should then be updated.

## A — Apple chain

1. **Apple Developer Program** (developer.apple.com, $99/yr): enroll as the
   organization (needs a D-U-N-S number — can take days; start first).
2. In **Certificates, Identifiers & Profiles**: register the App ID
   `org.threeho.eventapp` with the **Push Notifications** capability, and
   create an **APNs Auth Key** (`.p8`, Keys section) — download once, store
   safely (needed later by the server-side push sender).
3. **App Store Connect**: create the app — name "3HO Event App", bundle id
   `org.threeho.eventapp`, primary language English.
4. `[dev]` Signing: open `npx cap open ios`, select the team, let Xcode manage
   signing automatically; archive → upload to TestFlight.
5. **TestFlight**: add internal testers; run the on-device QA below.
6. Listing: description, keywords, support URL (3ho.org), privacy policy URL,
   screenshots (6.9"/6.7" iPhone required; iPad 13" if iPad is enabled — or
   disable iPad).
7. **Privacy labels** (answers below) + review notes (below) → submit early
   November.

## B — Google chain

1. **Play Console** (play.google.com/console, $25 one-time): create the app —
   "3HO Event App", package `org.threeho.eventapp`.
2. **Firebase**: create a project, add an Android app with the package name,
   download **`google-services.json`** → `[dev]` place in `android/app/`
   (required for FCM push registration; the Capacitor template picks it up).
   Note the project's service-account credentials — the server-side sender
   will need them.
3. `[dev]` Build a signed AAB (`npx cap open android` → Build → Generate
   Signed Bundle; let Play manage the signing key) → upload to **Internal
   testing**; run the on-device QA below.
4. Listing: descriptions, screenshots (phone required), privacy policy URL,
   **Data safety form** (answers below), content rating questionnaire
   (reference/guide app, no UGC in this release), target-audience (18+ or
   general — not child-directed).
5. Promote to Production early November (first review can take days).

## C — Assets `[dev]`

Once the final 1024 px icon art replaces `assets/icon.png`:

```bash
npx @capacitor/assets generate --ios --android
npm run cap:sync
```

## D — Privacy answers (derived from the actual code)

The app collects **no** analytics, ads identifiers, location, or diagnostics.

| Data | When | Linked to identity? | Purpose |
|---|---|---|---|
| Email + name | Optional account only | Yes (the account) | Sign-in, favorites sync |
| Favorited sessions | Signed-in sync only | Yes (the account) | App functionality (cross-device sync) |
| Push token + notification prefs + active event + app version | If notifications allowed | No (anonymous unless signed in) | Push delivery |
| Contact-form fields (name, email, phone, message) | Only when the user sends a message | Used to respond, not stored as a profile | App functionality |

- **Apple labels**: "Data Linked to You" → Contact Info (email, name), User
  Content (favorites) — *only for account holders*; "Data Not Linked to You" →
  Identifiers (device push token). Tracking: **No**.
- **Play Data safety**: collects Email + Name (optional, account), Device IDs
  (push token); encrypted in transit; user can request deletion; **no**
  sharing with third parties, **no** ads.

## E — Review notes (paste into both stores)

> The app is an offline-first event guide. Accounts are OPTIONAL — all content
> works without signing in. Commerce links out to the organization's existing
> ticketing website; there are no in-app purchases. Notification permission is
> requested in context (first favorited session or enabling a notification
> toggle), never at launch. Demo account for review: **create a dedicated
> 3ho.org test account and paste its credentials here** (never reuse a real
> user's account).

## F — On-device QA (physical iPhone + Android)

- Install → airplane-mode cold start → program/info/map/menus all render.
- Favorite a session → reminder fires 15 min before (set a near-future test
  session) → session moved server-side → "Schedule change" notification on
  next sync.
- Sign in → favorites sync; sign out → app still fully usable.
- Allow notifications → device row appears server-side (anonymous), prefs
  toggles round-trip.
- Push delivery end-to-end (needs APNs key/FCM configured + server sender).

## G — Timeline (backwards from Nov 24)

| Week | Milestone |
|---|---|
| Sep (now) | Apple enrollment + D-U-N-S · Play Console · Firebase project · final icon art commissioned · account-deletion feature scheduled |
| Early Oct | APNs key + google-services.json in place `[dev]` → server-side push sender can be built · TestFlight/Internal builds circulating |
| Late Oct | Listings + screenshots + privacy forms complete · on-device QA green |
| Early Nov | Submit both stores (buffer for rejections) |
| **Nov 24** | Both apps publicly live |
