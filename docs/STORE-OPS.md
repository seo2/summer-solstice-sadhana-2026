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
- Privacy policy at **`/privacy`**, updated 2026-09-14 (cache v88) to the
  **no-accounts** release: the "Optional account" section is gone, push is
  described as fully anonymous. ⚠️ Still pending: organization review of the
  text, and the **public web domain** decision (the policy URL for the stores,
  e.g. `https://<final-domain>/privacy`).
- iOS `ITSAppUsesNonExemptEncryption = NO` set (2026-09-14) — standard HTTPS
  only, so App Store Connect skips the export-compliance question per build.
- Android `targetSdkVersion 36` / `compileSdk 36` — meets Play's current
  target-API requirement.
- **Listing copy ready to paste** (names, descriptions, keywords, promo text,
  What's New, review notes, screenshot plan): [STORE-LISTING.md](STORE-LISTING.md).

## ~~Blocker: in-app account deletion (G1)~~ — resolved by dropping sign-up

Apple guideline 5.1.1(v) requires in-app account deletion from any app that
offers **account creation**. Rather than build the deletion flow for the first
release, **sign-up was removed from the app** (2026-09-02, cache v68):
`ACCOUNT_CREATION_ENABLED = false` in `src/app/account/page.tsx` hides the
"Create account" tab and its fields, leaving only sign-in. Accounts are created
on 3ho.org, so the guideline no longer applies.

Two things to keep in mind:

- **The backend endpoint still exists.** Only the app's UI was removed, so if a
  reviewer probes the API this is not "account creation offered by the app" —
  but be ready to say that accounts are made on the website.
- **To bring sign-up back**, flip that constant *in the same change set* that
  ships account deletion (`auth/delete-account` in the plugin + a button in
  `/account`), and restore the privacy policy's wording about creating accounts.
- **Sign-in is hidden as well** (2026-09-04, cache v79): since attendees cannot
  create accounts anywhere yet, `ACCOUNT_SIGN_IN_ENABLED = false` in
  `src/lib/features.ts` removes the header account button (logged-out state),
  the Event-home "Account" tile and the `/account` form (a notice shows
  instead). For review purposes the app currently offers **no** account
  functionality to a fresh install; the "Optional account" section of the
  privacy policy still describes what happens *if* a session exists. Details in
  [ACCOUNTS.md](ACCOUNTS.md).

## A — Apple chain

1. **Apple Developer Program** (developer.apple.com, $99/yr): enroll as the
   organization (needs a D-U-N-S number — can take days; start first).
   💡 **Nonprofit fee waiver**: US nonprofits can request a waiver of the $99/yr
   during enrollment (checkbox), provided they never sign the Paid Applications
   Agreement — our app has no paid apps/IAP (commerce is link-out), so 3HO
   likely qualifies → $0/yr if approved.
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

1. **Play Console** (play.google.com/console, $25 one-time): sign up as an
   **ORGANIZATION account** — critical: org accounts (verified with a D-U-N-S
   number and the EXACT legal entity name from registration documents) are
   **exempt from the 12-testers-for-14-days closed-testing rule** that personal
   accounts must pass before production; a personal account would sink the
   Nov 24 timeline. Then create the app — "3HO Event App", package
   `org.threeho.eventapp`.
2. **Firebase**: create a project, add an Android app with the package name,
   download **`google-services.json`** → `[dev]` place in `android/app/`
   (required for FCM push registration; the Capacitor template picks it up).
   Until that file exists the app **deliberately skips Android push
   registration** — calling it without FCM crashes the process on every launch
   (see [NATIVE.md](NATIVE.md)). Dropping the file in re-enables registration
   automatically on the next `npm run build`; no code change needed.
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

The app collects **no** analytics, ads identifiers, location, or diagnostics —
and since the no-accounts decision (v68/v79), **no account data at all**.

| Data | When | Linked to identity? | Purpose |
|---|---|---|---|
| Push token + notification prefs + active event + app version | Only if notifications allowed | No (fully anonymous) | Push delivery |
| Contact-form fields (name, email, phone, message) | Only when the user sends a message | Used to respond, not stored as a profile | App functionality |

- **Apple labels**: "Data Not Linked to You" → Identifiers (device push
  token), Contact Info (name/email — contact form only, app functionality).
  Nothing under "Data Linked to You". Tracking: **No**.
- **Play Data safety**: collects Device IDs (push token, optional) and
  Name/Email (contact form, optional); encrypted in transit; deletion on
  request; **no** sharing with third parties, **no** ads.

## E — Review notes (paste into both stores)

> There is NO sign-in and NO account — every feature works immediately on
> first launch, so **no demo credentials are needed**. Commerce links out to
> the organization's existing ticketing website; there are no in-app
> purchases. Notification permission is requested in context (first favorited
> session or enabling a notification toggle), never at launch.
> Full paste-ready version in [STORE-LISTING.md](STORE-LISTING.md).

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
