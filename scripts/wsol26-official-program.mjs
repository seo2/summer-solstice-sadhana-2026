#!/usr/bin/env node
/**
 * wsol26-official-program.mjs — writes the official Winter Solstice 2026
 * program into scripts/fixtures/wsol26.json (program, venues, teachers), as
 * read from the programming team's master sheet:
 *
 *   https://docs.google.com/spreadsheets/d/1i62hOJiy1rlJFBStv884FB2p6Kp_OYpN97QNPKMcvCU
 *   ("Copy of Programming Team Master Doc", tab "General Program", read 2026-10-29)
 *
 * The sheet is a grid (hours × day/venue columns) with merged cells and free
 * text, so it is transcribed here by hand rather than parsed. Every reading
 * decision and every open question is listed in docs/WSOL26-PROGRAM.md — keep
 * the two in step when the sheet changes, then:
 *
 *   node scripts/wsol26-official-program.mjs      → rewrites the fixture (bumps version)
 *   npm run fixtures:csv -- wsol26                → CSVs for Event App → Import
 *
 * Joins are by NAME (docs/CONTENT-MODEL.md): every `location` below must be a
 * venue name in the fixture and every `facilitator` must appear in a teacher's
 * facilitatorNames; the script asserts both before writing.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE = join(ROOT, "scripts", "fixtures", "wsol26.json");
const SUMMER_TEACHERS = join(ROOT, "src", "data", "teachers.json");

/* ---------------------------------------------------------------- venues */
const TANTRIC = "TANTRIC SHELTER";
const GURDWARA = "GURDWARA";
const CHURUATA = "CHURUATA";
const TREE = "TREE PAVILION";
const INCO = "INCO PARK";
const KIDS = "CHILDREN'S CAMP";
const YOGI_TEA = "BAZAAR / YOGI TEA";
const OFFICE = "OFFICE";

/* ------------------------------------------------------------- teachers */
// Names exactly as production (winter-solstice-2026) carries them, so the
// CSV joins on import without edits.
const HARIDASS = "Dr Haridass Kaur";
const CHRIS = "Chris Maanas";
const SAT_BIR = "Sat Bir Singh";
const SIRI_SIMRAN = "Siri Simran Kaur";
const DEVI = "Devi Rajpriti Kaur";
const CHIEF = "Chief Open Heart";
const JOT_SIMRIT = "Jot Simrit";
const DYAL = "Dyal Gobinde";
const KHUSHBIR = "Khushbir Singh";
const KARUNA = "Karuna";
const KARINA = "Karina Skye";

/* ----------------------------------------------------------------- copy */
const TBA = ["To be announced"];

const RISE = "Wake up, get cleaned up, get ready for Sadhana!";
const SADHANA = "Japji Sahib, a Kundalini Yoga kriya and the Aquarian Sadhana mantras. Come as you are, bring a blanket.";
const SADHANA_WTY = `${SADHANA} Shorter on White Tantric Yoga® days.`;
const GURD = "Gurdwara is a sacred space of Shabad (sound current), sangat (community), and seva (service). Whether this is your first time or a treasured tradition, you're invited to sit together in remembrance, sing the Naam, and bathe the mind in Gurbani kirtan. All are welcome.";
const GURD_WTY = `${GURD} Shorter on White Tantric Yoga® days.`;
const MEDITATION_KY = "A short all-camp meditation, then meet your Karma Yoga or Service Exchange team. All attendees have a karma yoga: it keeps the event sustainable and flowing. Unsure of yours? Ask at the event office.";
const LUNCH = "Free time until the afternoon program.";
const REHRAS = "Evening prayer, followed by Sukhasan (Hukam, Kirtan Sohila, Ardas).";
const WTY = "Gates open 7:15 AM, warm-ups 8:00 AM. Wear white clothing and a white head covering. Lunch is served midday. Doors close when a meditation begins and reopen when it ends.";
const MONITORS = "During lunch. Interested in being a Monitor at White Tantric Yoga® (WTY)? A WTY Monitor must have attended at least one day of WTY, wear white clothing and a white head covering, and wear the Monitor ID marker. Monitors receive the same benefits of WTY as if they were doing the meditations with a partner.";
const FIRST_TIMERS = "During dinner. First time at White Tantric Yoga®? Meet the WTY team and learn what to expect over the three days.";
const SNR = "Sat Nam Rasayan®: healing through awareness, in deep meditative silence. All camp together, no parallel classes, with a short break at 3:30 PM.";
const ALL_CAMP = "All camp together, no parallel classes.";
const CHECKIN = "Have your ticket QR code and a photo ID ready. If you don't have a service exchange or karma yoga team yet, one will be assigned at check-in. Check-in hours to be confirmed.";
const ORIENTATION = "The program begins at 3:00 PM with an orientation and the first sessions. Details to be announced.";
const OPENING = "Come open the space with us! Welcome home, welcome back. Join the teachers to open this Winter Solstice Celebration with music, laughter, meditation and joy.";
const KIDS_DESC = "Program for children and youth while the adults are in class. Parents check children in and out. Daily schedule to be announced.";
const KIDS_THU = `${KIDS_DESC} Today the Kids Camp visits the Gurdwara at 2:30 PM.`;
const MUSIC = "Live music at the Yogi Tea Café. Musicians to be announced.";
const GONG = "Gong meditation and deep relaxation at the Churuata. Bring a blanket. Facilitator to be announced.";
const SDI = "Sikh Dharma International gathering. Title and presenters to be announced.";
const IKYTA = "International Kundalini Yoga Teachers Association session. Details to be announced.";
const WOMEN = "Facilitator to be announced.";
const TANTRIC_INTEGRATION = "Integrate the three days of White Tantric Yoga®. Facilitator to be announced.";
const CLOSING = "All camp together to close the Solstice, leading into Nagar Kirtan.";
const NAGAR = "Kirtan procession through camp to the Gurdwara, leading into Rensabai. Start time to be confirmed.";
const RENSABAI = "Rensabai Kirtan: musicians take turns singing Gurbani through the evening. Start time to be confirmed (7:30 or 8:00 PM).";
const DEPART = "Everyone who is not helping with camp tear-down leaves the site in the morning. Travel day: no afternoon or evening program.";

/* ------------------------------------------------------------- builders */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const slug = (s) => s.toLowerCase().replace(/®/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const items = [];
function add(date, startTime, endTime, title, { category, location, facilitator, description, tags } = {}) {
  const item = { id: `${date}-${startTime.replace(":", "")}-${slug(title)}`, date, day: DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()], startTime };
  if (endTime) item.endTime = endTime;
  item.title = title;
  if (category) item.category = category;
  if (tags) item.tags = [...tags];
  if (location) item.location = location;
  if (facilitator) item.facilitator = facilitator;
  if (description) item.description = description;
  items.push(item);
}

const rise = (d, end) => add(d, "03:00", end, "Rise up sweet family dear!", { description: RISE });
const sadhana = (d, s, e, extra = {}) => add(d, s, e, "Aquarian Sadhana", { category: "Sadhana", location: TANTRIC, description: SADHANA, ...extra });
const gurdwara = (d, s, e, description = GURD) => add(d, s, e, "Gurdwara", { category: "Gurdwara", location: GURDWARA, description });
const meal = (d, s, e, name, description) => add(d, s, e, `🍴 ${name}`, { category: "Meal", location: CHURUATA, description });
const meditationKY = (d) => add(d, "08:30", "09:30", "All-Camp Meditation & Karma Yoga Meetings", { category: "Community", location: TANTRIC, description: MEDITATION_KY });
const kids = (d, description = KIDS_DESC) => add(d, "09:00", "17:00", "Kids Camp", { category: "Community", location: KIDS, description, tags: TBA });
const rehras = (d) => add(d, "17:00", "17:30", "Rehras", { category: "Gurdwara", location: GURDWARA, description: REHRAS });
const karmaYoga = (d) => add(d, "18:30", "19:30", "Karma Yoga Action", { category: "Service" });
const evening = (d) => {
  add(d, "19:30", "21:30", "Yogi Tea Café Music", { category: "Music", location: YOGI_TEA, description: MUSIC, tags: TBA });
  add(d, "20:30", "21:30", "Gong Meditation", { category: "Meditation", location: CHURUATA, description: GONG, tags: TBA });
};
const night = (d) => {
  add(d, "21:45", null, "Bazaar closes", { category: "Logistics" });
  add(d, "22:00", null, "🌙 Lights Out", { category: "Logistics" });
};
const cls = (d, s, e, title, category, location, facilitator, extra = {}) => add(d, s, e, title, { category, location, facilitator, ...extra });

/* ------------------------------------------------------------- Tue Dec 15 · arrival */
let d = "2026-12-15";
add(d, "13:00", "20:00", "Arrival & Registration", { category: "Logistics", location: OFFICE, description: CHECKIN, tags: TBA });
add(d, "15:00", "17:30", "Orientation & First Sessions", { category: "Community", location: TANTRIC, description: ORIENTATION, tags: TBA });
meal(d, "17:30", "18:30", "Dinner");
karmaYoga(d);
add(d, "19:30", "21:00", "Opening Circle", { category: "Community", location: TANTRIC, description: OPENING });
night(d);

/* ------------------------------------------------------------- Wed Dec 16 · full program day */
d = "2026-12-16";
rise(d, "03:40");
sadhana(d, "03:40", "06:00", { facilitator: HARIDASS });
gurdwara(d, "06:00", "07:15");
meal(d, "07:15", "08:15", "Breakfast");
meditationKY(d);
kids(d);
cls(d, "09:45", "11:00", "Raising the Heart with our Inner Sun Power", "Kriya and Meditation", CHURUATA, CHRIS);
cls(d, "09:45", "11:00", "Understanding the Science and Research on Yoga", "Lecture", TREE, SAT_BIR);
cls(d, "11:15", "12:30", "SDI Gathering", "Workshop", CHURUATA, null, { description: SDI, tags: TBA });
cls(d, "11:15", "12:30", "IKYTA Day", "Workshop", TREE, null, { description: IKYTA, tags: TBA });
meal(d, "12:30", "13:45", "Lunch", LUNCH);
add(d, "12:30", "13:45", "WTY Monitors Meeting", { category: "White Tantric Yoga", location: CHURUATA, description: MONITORS });
cls(d, "13:45", "17:00", "Sat Nam Rasayan", "Meditation", TANTRIC, SIRI_SIMRAN, { description: SNR });
rehras(d);
meal(d, "17:30", "18:30", "Dinner");
add(d, "17:30", "18:30", "WTY First Timers Meeting", { category: "White Tantric Yoga", location: CHURUATA, description: FIRST_TIMERS });
karmaYoga(d);
evening(d);
night(d);

/* ------------------------------------------------------------- Thu 17 · Fri 18 · Sat 19 · White Tantric Yoga® */
for (const [date, n] of [["2026-12-17", "One"], ["2026-12-18", "Two"], ["2026-12-19", "Three"]]) {
  rise(date, "03:40");
  sadhana(date, "03:40", "05:50", { description: SADHANA_WTY });
  gurdwara(date, "05:50", "07:00", GURD_WTY);
  meal(date, "07:00", "08:00", "Breakfast");
  add(date, "08:00", "17:30", `White Tantric Yoga® – Day ${n}`, { category: "White Tantric Yoga", location: TANTRIC, description: WTY });
  kids(date, n === "One" ? KIDS_THU : KIDS_DESC);
  meal(date, "17:30", "18:30", "Dinner");
  karmaYoga(date);
  evening(date);
  night(date);
}

/* ------------------------------------------------------------- Sun Dec 20 · full program day + Rensabai */
d = "2026-12-20";
rise(d, "03:40");
sadhana(d, "03:40", "06:00");
gurdwara(d, "06:00", "07:15");
meal(d, "07:15", "08:15", "Breakfast");
meditationKY(d);
kids(d);
cls(d, "09:45", "11:00", "Divine Mother: The Love That Holds Everything", "Kriya and Meditation", CHURUATA, DEVI);
cls(d, "09:45", "11:00", "Men's Circle", "Community", INCO, CHIEF);
cls(d, "11:15", "12:30", "Conscious Communication within Silence", "Meditation", CHURUATA, JOT_SIMRIT);
cls(d, "11:15", "12:30", "Winter Solstice Glandular Summit", "Kriya and Meditation", TREE, DYAL);
cls(d, "11:15", "12:30", "Women's Circle", "Community", INCO, null, { description: WOMEN, tags: TBA });
meal(d, "12:30", "13:45", "Lunch", LUNCH);
cls(d, "13:45", "15:30", "Rewiring Stress into Strength", "Kriya and Meditation", TANTRIC, HARIDASS, { description: ALL_CAMP });
cls(d, "15:45", "17:00", "Rejuvenate: Emotional Balance & Alertness", "Kriya and Meditation", CHURUATA, KHUSHBIR);
cls(d, "15:45", "17:00", "The Preserver", "Kriya and Meditation", TREE, KARUNA);
cls(d, "15:45", "17:00", "Tantric Integration Circle", "Kriya and Meditation", INCO, null, { description: TANTRIC_INTEGRATION, tags: TBA });
rehras(d);
meal(d, "17:30", "18:30", "Dinner");
add(d, "18:30", "19:30", "Closing Circle", { category: "Community", location: TANTRIC, description: CLOSING });
add(d, "19:30", null, "Nagar Kirtan", { category: "Gurdwara", description: NAGAR, tags: TBA });
add(d, "20:00", null, "Rensabai Kirtan", { category: "Music", location: GURDWARA, facilitator: KARINA, description: RENSABAI, tags: TBA });
night(d);

/* ------------------------------------------------------------- Mon Dec 21 · departure */
d = "2026-12-21";
rise(d, "03:40");
sadhana(d, "03:40", "06:00");
gurdwara(d, "06:00", "07:15");
meal(d, "07:15", "08:15", "Breakfast");
add(d, "08:15", null, "Start the Journey Home", { category: "Logistics", description: DEPART });

/* ------------------------------------------------------------- ids: parallel sessions share date+time+title only by accident */
const seen = new Map();
for (const item of items) seen.set(item.id, (seen.get(item.id) ?? 0) + 1);
for (const item of items) {
  if (seen.get(item.id) > 1 && item.location) item.id = `${item.id}-${slug(item.location)}`;
}
if (new Set(items.map((i) => i.id)).size !== items.length) throw new Error("duplicate ids");

/* ------------------------------------------------------------- fixture */
const fixture = JSON.parse(readFileSync(FIXTURE, "utf8"));

// Venues: Inco Park hosts circles now (was a map-only landmark); Tree Pavilion
// is new and not on the map artwork yet (no mapPoint → listed, not drawn).
const inco = fixture.venues.find((v) => v.id === "inco-park");
if (!inco) throw new Error("fixture has no inco-park venue");
inco.kind = "venue";
inco.description = "Open lawn for circles and outdoor classes.";
if (!fixture.venues.some((v) => v.id === "tree-pavilion")) {
  fixture.venues.push({ id: "tree-pavilion", name: TREE, description: "Open-air pavilion under the trees for workshops. Location on the map to be confirmed.", kind: "venue" });
}

// Teachers: the 12 presenters production already carries (same ids, so the CSV
// updates rather than duplicates) plus the two the sheet adds, taken from the
// summer booklet data.
const PRODUCTION_TEACHERS = JSON.parse(readFileSync(join(ROOT, "references", "wsol26-teachers-production.json"), "utf8"));
const summer = JSON.parse(readFileSync(SUMMER_TEACHERS, "utf8"));
const extra = [CHIEF, KARINA].map((name) => {
  const t = summer.find((x) => x.name === name);
  if (!t) throw new Error(`summer teachers.json has no ${name}`);
  return { id: t.id, name: t.name, facilitatorNames: t.facilitatorNames, bio: t.bio ?? "", country: t.country === "USA" ? "United States" : t.country, ...(t.photo ? { photo: t.photo } : {}) };
});
fixture.teachers = [...PRODUCTION_TEACHERS, ...extra].sort((a, b) => a.name.localeCompare(b.name));

// Joins by name.
const venueNames = new Set(fixture.venues.map((v) => v.name));
const categoryNames = new Set(fixture.categories.map((c) => c.name));
const facilitatorNames = new Set(fixture.teachers.flatMap((t) => t.facilitatorNames ?? [t.name]));
for (const item of items) {
  if (item.location && !venueNames.has(item.location)) throw new Error(`${item.id}: unknown venue ${item.location}`);
  if (item.category && !categoryNames.has(item.category)) throw new Error(`${item.id}: unknown category ${item.category}`);
  if (item.facilitator && !facilitatorNames.has(item.facilitator)) throw new Error(`${item.id}: unknown facilitator ${item.facilitator}`);
}

items.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime) || (a.endTime ?? "").localeCompare(b.endTime ?? "") || a.title.localeCompare(b.title));
fixture.program = items;
fixture.version = (fixture.version ?? 0) + 1;
fixture._comment = "Dummy WSOL26 bundle for local testing. Event metadata (name, dates, venue) and the White Tantric Yoga days (Dec 17-19) mirror the real registration system. The PROGRAM, VENUES and TEACHERS are the official Winter Solstice 2026 program as read from the programming team's master sheet, written by scripts/wsol26-official-program.mjs (reading decisions and open questions in docs/WSOL26-PROGRAM.md); items tagged 'To be announced' are the ones the sheet leaves open. Info pages and menus are interim. Venue map pins are measured on the real map artwork (references/winter-solstice-map-revised-v3.jpg, served by the mock as /photos/wsol26-map.jpg). Served by scripts/mock-backend.mjs and convertible to CSV with scripts/fixture-to-csv.mjs. See docs/CONTENT-MODEL.md.";

writeFileSync(FIXTURE, `${JSON.stringify(fixture, null, 2)}\n`);

const perDay = {};
for (const item of items) perDay[item.date] = (perDay[item.date] ?? 0) + 1;
console.log(`fixture v${fixture.version}: ${items.length} program items`, perDay);
console.log(`teachers ${fixture.teachers.length}, venues ${fixture.venues.length}, "To be announced" ${items.filter((i) => i.tags?.includes("To be announced")).length}`);
