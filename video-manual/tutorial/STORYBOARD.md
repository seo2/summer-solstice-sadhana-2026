---
format: 1080x1920
duration: 128.6s
message: "Everything you need for Winter Solstice Sadhana 2026, step by step, in one app"
arc: Welcome → Get the app → Open event → Navigate → Program → Search → Details → Favorites → Teachers → Menus → Info → Map → Announcements → Contact → Offline → Close
audience: Winter Solstice Sadhana 2026 attendees (3HO)
mode: collaborative
---

## Frame 1 — Winter Solstice Sadhana 2026

- duration: 9.0s
- transition_in: cut
- status: animated
- src: compositions/frames/01-welcome.html
- voiceover: "Welcome to Winter Solstice Sadhana 2026. Here's how to use the event app, step by step."

Event home rises in the phone; title + dates.

## Frame 2 — Get the app

- duration: 7.4s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-get-the-app.html
- voiceover: "Download the free 3HO Event App from the App Store or Google Play."

App Store listing; chips App Store · Google Play.

## Frame 3 — Open your event

- duration: 9.6s
- transition_in: crossfade
- status: animated
- src: compositions/frames/03-open-your-event.html
- voiceover: "Open the app and tap Winter Solstice Sadhana 2026. It downloads once, then works offline."

App Home events list; tap Winter Solstice Sadhana 2026; "Downloads once, then works offline".

## Frame 4 — Find your way

- duration: 9.0s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-find-your-way.html
- voiceover: "The bar at the bottom takes you everywhere: Home, Program, Favorites, Info, Map and Contact."

Event home; the six bottom tabs light up one by one.

## Frame 5 — Browse the program

- duration: 8.0s
- transition_in: crossfade
- status: animated
- src: compositions/frames/05-browse-the-program.html
- voiceover: "In Program you'll find every session. Tap a day to jump straight to it."

Program list scrolls; a day chip is tapped and the list jumps.

## Frame 6 — Search and filter

- duration: 9.7s
- transition_in: crossfade
- status: animated
- src: compositions/frames/06-search-and-filter.html
- voiceover: "Looking for something specific? Search by name or teacher, or filter by venue, category and time of day."

Search typed; venue/category; Advanced filters → Morning; compact bar while scrolling.

## Frame 7 — Session details

- duration: 7.3s
- transition_in: crossfade
- status: animated
- src: compositions/frames/07-session-details.html
- voiceover: "Tap any session to see when and where it is, and what to expect."

Tap a card → detail sheet: time, venue, teacher, description.

## Frame 8 — Save your favorites

- duration: 9.9s
- transition_in: crossfade
- status: animated
- src: compositions/frames/08-save-favorites.html
- voiceover: "Tap the heart to save a session. Your Favorites become your personal agenda, and the app reminds you 15 minutes before."

Heart tapped on two sessions → Favorites tab lists them; reminder note.

## Frame 9 — Meet the teachers

- duration: 7.3s
- transition_in: crossfade
- status: animated
- src: compositions/frames/09-meet-the-teachers.html
- voiceover: "Tap Teachers to meet the people leading the event and read their bios."

Teachers list → one bio with their sessions.

## Frame 10 — Daily menus

- duration: 6.4s
- transition_in: crossfade
- status: animated
- src: compositions/frames/10-daily-menus.html
- voiceover: "Check Menus to see what's being served each day."

Menus tile → a day's meals.

## Frame 11 — The Info hub

- duration: 7.0s
- transition_in: crossfade
- status: animated
- src: compositions/frames/11-info-hub.html
- voiceover: "Info gathers everything you need to know, grouped by topic."

Info hub topic tiles (Start Here, Health & Safety, Camp Life…).

## Frame 12 — Find any venue

- duration: 8.9s
- transition_in: crossfade
- status: animated
- src: compositions/frames/12-camp-map.html
- voiceover: "Use the Map to find any venue. Pinch or tap plus to zoom, and tap a place to see what it is."

Map overview → pinch / + to zoom → tap a venue chip.

## Frame 13 — Stay in the loop

- duration: 8.0s
- transition_in: crossfade
- status: animated
- src: compositions/frames/13-stay-in-the-loop.html
- voiceover: "The bell shows announcements from the event team. Turn on alerts so you don't miss a change."

Bell with badge → announcements feed; notification toggles.

## Frame 14 — Contact the team

- duration: 7.7s
- transition_in: crossfade
- status: animated
- src: compositions/frames/14-contact-the-team.html
- voiceover: "Have a question? Send it from Contact. If you're offline, it goes out when you're back."

Contact form.

## Frame 15 — No signal? No problem.

- duration: 7.4s
- transition_in: crossfade
- status: animated
- src: compositions/frames/15-works-offline.html
- voiceover: "No signal? No problem. Your program, map and info stay on your phone."

Airplane glyph; Program, Map, Info tiles check in.

## Frame 16 — Winter Solstice Sadhana 2026

- duration: 6.0s
- transition_in: crossfade
- status: animated
- src: compositions/frames/16-see-you-there.html
- voiceover: "See you at Winter Solstice Sadhana. Sat Nam."

3HO logo, event name, dates, place.

## Notes

- 2026-10-20 build: voice-over is local Kokoro (af_heart) — HeyGen's free allowance was used up
  (1 s left; renews next month). Spoken spellings: Sadhana → "Sahdhunah", 3HO → "three H O",
  Sat Nam → "Sut Naam". Re-voicing later only means replacing `assets/voice/vo*.wav` and rerunning
  `scripts/make.sh` (scene lengths follow `dur` in `scripts/build.py`).
- Taps are timed to the word that names them (word times in `assets/voice/vo*.words.json`).
- Music: `assets/audio/music-bed-long.m4a` = the tour's bed looped once with a 4 s crossfade, carved under the voice.
