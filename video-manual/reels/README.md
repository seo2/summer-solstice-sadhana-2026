# Launch reels — 3HO Event App (Winter Solstice Sadhana 2026)

Three short vertical videos (1080×1920, 30 fps, music, no voice-over) for the app launch on
Instagram / Facebook Reels, from the social team's script "Lanzamiento de App – Redes Sociales".
Each reel is its own HyperFrames project; one generator builds all three.

| Reel | Project | Length | Beats |
| --- | --- | --- | --- |
| 1 · The Big Reveal | `01-reveal/` | 15.2 s | "We have good news!" → "The official 3HO Event App is ready." → "Your digital pocket guide" (Program · Map · Info · Favorites) → "Start preparing for Winter Solstice." → end card |
| 2 · Design Your Experience | `02-plan/` | 16.2 s | "Plan your Solstice week with ease." → "Browse the full program" → "Filter by day, venue or category" (tap Wed, venue, category) → "Tap the heart to save your favorites" → "Find them all in Favorites" → end card |
| 3 · Peace of Mind | `03-offline/` | 17.2 s | "Everything you need, right in your pocket." → "Find every venue on one map" (zoom, tap ASTA) → "No signal? No problem." (Program ✓ Map ✓ Info ✓) → "Open it once on Wi-Fi before you travel." → "See you there" end card with dates and place |

End card (all three): app icon, "3HO Event App", App Store / Google Play pills, "Free download".

## Copy decisions (vs. the script)

- "Plan your Sadhana" → "Plan your Solstice week": Sadhana is the morning practice, not the whole program.
- The app has no "My Agenda" section, so the hearts beat ends on **Favorites**.
- Added "Open it once on Wi-Fi before you travel": content downloads on first open; without it a
  first launch at the camp with no signal shows nothing.
- Store-only rule: no web version / Add to Home Screen anywhere (the Info capture is scrolled past
  that link).

## Design

Palette, type and phone follow `../frame.md` (solstice blue / sky / orange / gold, Geist Black).
Text lives in the top band (200–600 px); the phone sits below and the camera moves it so the
part of the screen being talked about stays inside the platform-safe band (168–1330 px). Taps
(orange circles), rings and heart pops sit on real tap targets from `shots/rects.json`.

Music: `../assets/audio/music-upbeat.m4a`, 115 bpm. Every cut and tap is on the beat grid
(B = 0.5215 s); each reel starts the track at a different point so its end card lands on the
track's strongest hit (23.48 s into the file). Volume 0.7 (the file is mastered hot, −13 LUFS).

## Rebuild

```bash
# 1. fresh captures (needs the app's dev server; .claude/launch.json → ssol-dev-3017)
cd video-manual/reels
BASE=http://localhost:3017 ADOPT=1 node scripts/capture.mjs /tmp/reels-profile
# 2. regenerate the three projects (copies shots, fonts, icon, music into each)
python3 scripts/build.py
# 3. check and render
(cd 02-plan && npx --yes hyperframes@0.8.181 check)
(cd 02-plan && npx --yes hyperframes@0.8.181 render -q delivery -o ../renders/wsol26-reel-02-plan.mp4)
```

Edit copy, timing and camera rows in `REELS` at the top of `scripts/build.py`, never in the
generated HTML. MP4s in `renders/` are gitignored.

## Notes

- Captured 2026-11-03 from `main` against production content (`winter-solstice-2026`, official
  program). Program cards show the **teacher photo** (cache v91), which is on `main` but not yet
  in the store build: publish that build before posting, or recapture from the released commit.
