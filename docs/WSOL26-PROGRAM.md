# Winter Solstice 2026 — the official program

How the programming team's master sheet became the app's program, what was decided while
reading it, what was left out, and what is still open. Companion to
[CONTENT-MODEL.md](CONTENT-MODEL.md) (field contracts, joins, import) and
[WSOL26-PLAN.md](WSOL26-PLAN.md) (WS7 · Content).

## Source

**"Copy of Programming Team Master Doc"** (Google Sheets, shared by the owner on 2026-10-29):
<https://docs.google.com/spreadsheets/d/1i62hOJiy1rlJFBStv884FB2p6Kp_OYpN97QNPKMcvCU>

Only the **General Program** tab carries the schedule. It is a grid: one row per time slot
(columns A–C: time, session type, duration), one column per day, and the two class days
(Wed 16, Sun 20) split into five venue columns — Tantric Shelter, Gurdwara, Churuata, Tree
Pavilion, Inco Park. Tuesday 15 (arrival), Thu–Sat 17–19 (White Tantric Yoga®) and Monday 21
(departure) have one column each. Merged cells say "same thing across these venues / days",
free text in a cell is the session (usually `Title: Teacher`), `-` means nothing in that venue.

The other tabs are team notes: **Gurdwara** (three dated entries and a set-up checklist),
**Rensaibai** ("Karina Skye"), **Sadhana** (who leads which morning, with candidates),
**Youth camp** and **Team Needs** (empty), **Teacher Needs** (broken `#REF!`).

## What it became

| Artifact | Content |
|---|---|
| `scripts/wsol26-official-program.mjs` | The transcription: every session as code, with the reading decisions below. Run it to rewrite the fixture (it bumps `version`). |
| `scripts/fixtures/wsol26.json` (v10) | `program` 92 items over Dec 15–21 (21 tagged "To be announced"), `venues` 23 (Inco Park promoted to a program venue, Tree Pavilion added), `teachers` 14. |
| `references/wsol26-teachers-production.json` | Snapshot of the 12 presenters production already carries (ids, names, name variants, bios, photos), so the fixture and the CSV reuse their ids. |
| `scripts/fixtures/csv/wsol26-{program,venues,teachers}.csv` | What goes into **Event App → Import** (`npm run fixtures:csv -- wsol26`). |

Everything the sheet leaves open carries the tag **"To be announced"** and says what is
missing in its description, so it is visible in the app and easy to grep in the CSV.

## Reading decisions

Day structure, in the sheet's own times:

- **Tue 15 (arrival):** registration during the day ("volunteer setup, no public program"),
  program begins 3:00 PM with "orientation / first sessions", Dinner 5:30, Karma Yoga Action
  6:30, Opening Circle 7:30–9:00, bazaar closes 9:45, Lights Out 10:00.
- **Wed 16 and Sun 20 (full days):** Wake Up 3:00 · Aquarian Sadhana 3:40–6:00 · Gurdwara
  6:00–7:15 · Breakfast 7:15–8:15 · All-Camp Meditation + Karma Yoga Meetings 8:30–9:30 ·
  workshops 9:45–11:00 and 11:15–12:30 · Lunch + Free Time 12:30–1:45 · All-Camp Class
  1:45–3:30 ("everyone — no parallel classes") · workshops 3:45–5:00 · Rehras 5:00–5:30 ·
  Dinner 5:30–6:30 · Karma Yoga Action 6:30–7:30 · evening music 7:30–9:30 · bazaar 9:45 ·
  Lights Out 10:00.
- **Thu 17 – Sat 19 (WTY):** Sadhana 3:40–5:50 and Gurdwara 5:50–7:00 (cell note: "Shorten
  Kriya and Gurdwara on WTY days"), Breakfast 7:00–8:00, "Gates open 7:15 AM · White Tantric
  warm-ups 8:00 AM", then the WTY block fills the day through the Rehras row (5:30 PM).
- **Mon 21 (departure):** Sadhana, Gurdwara and Breakfast as on a full day, then "Departure —
  final morning practice complete. Travel day, no scheduled afternoon or evening program."

How the cells were turned into items:

- **"Wake Up"** is published as **"Rise up sweet family dear!"**, the traditional call the
  app has used since the summer booklet (it renders as a routine row).
- **Meals** sit at **CHURUATA** (the map's dining hall); the sheet gives no meal venue.
- **"All-Camp Meditation + KYM"** is one 8:30–9:30 item, *All-Camp Meditation & Karma Yoga
  Meetings*, at Tantric Shelter — the sheet gives the hour, not the split.
- **Breaks** (9:30, 11:00, 3:30) are not items.
- **Sat Nam Rasayan** (Wed): the all-camp class 1:45–3:30 and the "SNR" cell at 3:45–5:00
  are one item, 1:45–5:00 with a break, matching the 3-hour session of 2025.
- **WTY Monitors Meeting** (Wed, lunch row) and **WTY First Timers Meeting** (Wed, dinner
  row) are items over the meal hour at Churuata. The Monitors cell is merged Wed→Sun in the
  sheet; it is published for Wednesday only, as in 2025.
- **White Tantric Yoga® – Day One/Two/Three**: 8:00 AM (warm-ups) to 5:30 PM, description
  carries "gates open 7:15". The sheet does not state the end time.
- **Kids Camp** 9:00–5:00 on Wed–Sun as "To be announced" (the Youth camp tab is empty but
  exists); Thursday's description adds the Gurdwara visit at 2:30 PM from the Gurdwara tab.
- **Evening (Wed–Sat):** the row "Yogi Tea Café Music / Gong in Churuata at 8:30–9:30"
  becomes *Yogi Tea Café Music* 7:30–9:30 at BAZAAR / YOGI TEA and *Gong Meditation*
  8:30–9:30 at CHURUATA, both "To be announced" for the musicians.
- **Sunday evening:** *Closing Circle* 6:30–7:30 replaces Karma Yoga Action; *Nagar Kirtan*
  at 7:30 (no time in the sheet; its row sits between the closing circle and the Rensabai
  row); *Rensabai Kirtan* from 7:30 PM in the Gurdwara with Karina Skye, **through the
  night**, no end time (owner decision 2026-10-29: the grid says "7 or 8?", the Gurdwara tab
  7:30 PM — published at 7:30, tagged until the start is confirmed).
- **No Rehras on WTY days** (owner decision 2026-10-29): White Tantric Yoga® runs through the
  5:00 PM slot, so Thu–Sat carry no Rehras item.
- **Tuesday:** *Arrival & Registration* 1:00–8:00 PM at OFFICE (the map's registration
  point; hours tagged, the sheet gives none) and *Orientation & First Sessions* 3:00–5:30
  PM tagged.
- **Monday:** *Start the Journey Home* from 8:15, no end time.
- **Sadhana leaders:** only Wednesday is set (Dr Haridass Kaur, confirmed by the Sadhana
  tab). The other mornings have no facilitator; the Sadhana tab lists candidates (Manpreet
  Kaur, Satwant Singh, Dyal Gobinde Singh, Satkirin Kaur, Karina Skye, Sat Jot Singh).
- **Categories** are not in the sheet; assigned by title: kriya classes → *Kriya and
  Meditation*, Sat Bir Singh → *Lecture*, Sat Nam Rasayan / Jot Simrit / gong →
  *Meditation*, circles and all-camp gatherings → *Community*, SDI and IKYTA → *Workshop*,
  music and Rensabai → *Music*, Nagar Kirtan and Rehras → *Gurdwara*.

Teacher names are written **exactly as production carries them** (the join is by name):

| Sheet | Published as |
|---|---|
| Chris Manaas | Chris Maanas |
| Sat Bir Singh Khalsa | Sat Bir Singh |
| SiriSimran Kaur | Siri Simran Kaur |
| Haridass Kaur / Dr. Haridass | Dr Haridass Kaur |
| Khushbir | Khushbir Singh |
| Devi Rajpriti Kaur, Jot Simrit, Dyal Gobinde, Karuna | unchanged |
| Chief Open Heart, Karina Skye | added from the summer data (photo, no bio yet) |

Venue names stay **uppercase as on the map and in production**: TANTRIC SHELTER, GURDWARA,
CHURUATA, INCO PARK, TREE PAVILION, CHILDREN'S CAMP, plus the landmarks OFFICE and
BAZAAR / YOGI TEA used as locations. **Inco Park** was a map-only landmark and is now a
program venue (it keeps its pin); **Tree Pavilion** is new and has no pin until someone
points at it on the artwork (venues without `mapPoint` are listed, not drawn).

## Left out on purpose

- **KRI Trainer Forum** (Tue 10:30–5:00, Tantric Shelter): the sheet says "internal, not
  published".
- **Amrit at 2:00 AM on Mon 21** (Gurdwara tab): a ceremony note for the Gurdwara team, not
  confirmed as a public program item.
- **Tuesday's "unofficial setup sadhana"** (Sadhana tab): for the set-up crew.
- The Gurdwara set-up checklist, Team Needs and Teacher Needs.

## Open questions for the programming team

1. **WTY hours.** Confirm start and end (published 8:00 AM–5:30 PM; 2025 ran to 6:00 PM).
2. **Rensabai** start time (published 7:30 PM; it runs through the night, so Sunday's
   10:00 PM Lights Out, which the sheet merges across Tue–Sun, may not apply).
3. **Nagar Kirtan**: start time; published 7:30 PM right after the Closing Circle.
4. **Sat Nam Rasayan** (Wed): one session 1:45–5:00 with a break, or two?
5. **Sadhana leaders** for Thu–Mon.
6. **Facilitators** for Women's Circle (Sun 11:15, Inco Park) and Tantric Integration Circle
   (Sun 3:45, Inco Park, "??" in the sheet).
7. **SDI** and **IKYTA Day** (Wed 11:15): titles and presenters.
8. **Evening music**: musicians per night and whether music and gong share one space (note in
   the sheet: "Let's have the music, and gong together"). A loose note ": Chris Maanas -
   Meditation" is not placed anywhere.
9. **Registration hours** on Tuesday and what the 3:00 PM orientation contains.
10. **Kids Camp** daily schedule (Youth camp tab is empty).
11. **Tree Pavilion**: where it is on the map.
12. **Lights Out** moves from 9:45 (2025) to 10:00 PM; bazaar closes 9:45 — confirm.

## Importing into production

The production event is **`winter-solstice-2026`** (the fixture's `wsol26` is the mock's
slug). Order, in **Event App → Import** (plugin 0.12.0):

1. **Venues** · `wsol26-venues.csv` · *Add or update* — updates Inco Park (now `kind` venue)
   and adds Tree Pavilion; the other rows are unchanged re-imports (pins included).
2. **Teachers** · `wsol26-teachers.csv` · *Add or update* — the 12 existing rows match by id,
   Chief Open Heart and Karina Skye are added.
3. **Program** · `wsol26-program.csv` · **Replace**, *Validate only* first, then for real.
   Replace retires the rows the file does not carry; favorites on the recurring items
   (same ids: Sadhana, Gurdwara, meals, Lights Out…) survive.

Every import bumps `content_version`; installed apps pick it up on their next sync.

**Done 2026-10-29** (fixture v11): venues 23 imported (content version 23), teachers 14
(v24), program 92 imported and **60** template rows retired (v25) — not 87, because 27
recurring ids were shared with the template and updated in place. The public bundle
afterwards: 92 sessions, no duplicate ids, every `location`, `category` and `facilitator`
joined, INCO PARK a venue with its pin, TREE PAVILION listed without one. Each later
change to the sheet repeats step 3 only (plus 1 or 2 when venues or teachers change).

## Keeping it current

The sheet will change. Edit the transcription in `scripts/wsol26-official-program.mjs`
(the schedule is plain data at the bottom of the file; constants at the top hold venue and
teacher names and the shared copy), then:

```bash
node scripts/wsol26-official-program.mjs && npm run fixtures:csv -- wsol26
```

The script refuses to write when a `location`, `category` or `facilitator` does not match
the fixture by name, so a typo cannot reach the app as a session without a venue or teacher.
Then update this doc's open questions and the CHANGELOG, and re-import with Replace.
