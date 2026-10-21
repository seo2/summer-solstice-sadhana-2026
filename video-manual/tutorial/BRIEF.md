---
workflow: general-video
flow: automation
storyboard: yes
message: "Everything you need for Winter Solstice Sadhana 2026, step by step, in one app"
destination: youtube
aspect: 1080x1920
language: en
audience: Winter Solstice Sadhana 2026 attendees (3HO), including first-time and non-technical users
length: 150-180s
angle: step-by-step tutorial (show the tap, then the result)
---

## Intent

A longer, step-by-step tutorial for end users of the 3HO Event App at Winter Solstice
Sadhana 2026 (user, 2026-10-20: "un video de como se usa esta app, pensando en los usuarios
finales" → "Tutorial más completo", event "Winter Solstice 2026"). Vertical for YouTube
(Shorts allows up to 3 min) and the web. Follow-on to the 46 s tour in `../` (same design).

## Assets

- `assets/shots/*.png` — real captures of the app at 390×844 @3x with the live
  `winter-solstice-2026` event (production bundle v21), taken 2026-10-20 by `scripts/capture.mjs`;
  tap targets in `assets/shots/rects.json` (CSS px).
- `assets/11-appstore.png` — App Store listing capture (from the tour).
- `assets/3ho-logo-horizontal.png` — logo for the close.
- `assets/audio/music-bed.m4a` — soft music bed from the tour (75 s; needs looping or a longer bed).

## Customizations

- English voice-over + each scene's headline as the large on-screen step caption.
- Step counter in every kicker ("STEP 3 OF 14").
- Tap markers and rings on the real UI to show where to touch.

## Notes

- Winter event: Dec 15–21, 2026 · Lake Wales, FL. No Ram Das Puri / June / altitude.
- Info hub is interim/generic: topic tiles only, no zoom into page text.
- Production content gaps (2026-10-20): 0 dishes, 0 announcements, no session ↔ teacher links
  (teachers show "0 sessions"). Voice-over avoids promising those.
- Accounts / sign-in are hidden in the app: not shown.
- Favorite reminders (15 min before) exist only in the store app — which is the only install the video shows.
- User, 2026-10-20: "no quiero que mencionemos la opción web de la app, solo las de descarga de appstores" → no web / Add to Home Screen anywhere (VO, chips, captures).
