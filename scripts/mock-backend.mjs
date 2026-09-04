#!/usr/bin/env node
/**
 * mock-backend.mjs — a tiny stand-in for the 3ho-solstice-app WordPress
 * backend, for testing the app locally with NO WordPress running.
 * See docs/TESTING-LOCAL.md for the full walkthrough.
 *
 *   npm run mock-backend        → http://localhost:3999
 *
 * Serves (exact plugin response shapes):
 *   GET /wp-json/3ho-solstice/v1/sync?event=mocktest[&since=N]
 *       no since → full bundle v1 · since=1 → v2 (the favorited-session
 *       "Morning Sadhana" moves time+venue, exercising the change alerts)
 *       · since>=2 → { unchanged } — plus infoPages, menus, event.mapImage.
 *   GET /wp-json/3ho-solstice/v1/sync?event=<slug>[&since=N]
 *       any slug with a fixture at scripts/fixtures/<slug>.json — a full,
 *       realistic event bundle (e.g. "wsol26"). The file is re-read on every
 *       request, so editing it is enough; bump its `version` and the app
 *       treats the next fetch as an update. See docs/CONTENT-MODEL.md.
 *   GET /wp-json/3ho-solstice/v1/events/current
 *       the event the app should adopt: in progress > next to start > most
 *       recently finished, across every fixture.
 *   GET /wp-json/3ho-solstice/v1/home
 *       the Home feed: the events catalog (every fixture's event, plus the
 *       catalog-only fields and slugs in scripts/fixtures/home.json) and
 *       the staff posts from that same file. See docs/HOME.md.
 *   GET /wp-json/3ho-solstice/v1/updates?event=mocktest&since=N
 *   GET /wp-json/3ho-solstice/v1/channels/{id}/messages?since=N
 *   GET /mock/post?type=alert|official&body=…   → publish a new broadcast
 *   GET /photos/venue-map.svg, /photos/mock-teacher.png,
 *       /photos/event-cover.svg, /photos/post-cover.svg,
 *       /photos/wsol26-map.jpg (the real Winter Solstice map artwork from
 *       references/, so the WSOL26 fixture's pins can be checked visually)
 *
 * Pair it with the app: /sync-lab → base http://localhost:3999, event
 * "mocktest" → Fetch bundle → open it from Home's "Events" catalog.
 */
import { createServer } from "node:http";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FIXTURES_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const WSOL26_MAP_JPG = join(dirname(fileURLToPath(import.meta.url)), "..", "references", "winter-solstice-map-revised-v3.jpg");

/**
 * Load scripts/fixtures/<slug>.json fresh on every request, so editing a
 * fixture needs no server restart. Returns null when there is no such file
 * (the caller answers 404) or when the JSON is broken (logged, so a typo
 * while editing is obvious instead of silent).
 */
function loadFixture(slug) {
  if (!/^[a-z0-9-]{1,64}$/.test(slug)) return null;
  let raw;
  try {
    raw = readFileSync(join(FIXTURES_DIR, `${slug}.json`), "utf8");
  } catch {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`fixture ${slug}.json is not valid JSON: ${error.message}`);
    return null;
  }
}

const event = {
  slug: "mocktest",
  name: "Mock Winter Solstice",
  startDate: "2026-12-15",
  endDate: "2026-12-21",
  location: "Lake Wales, FL",
  status: "active",
  mapImage: "http://localhost:3999/photos/venue-map.svg",
};

const MAP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#e8f4e0"/>
  <ellipse cx="900" cy="600" rx="260" ry="150" fill="#a8d4e6"/>
  <text x="900" y="605" text-anchor="middle" font-family="Arial" font-size="28" fill="#2f62b6">Tiger Lake</text>
  <rect x="120" y="120" width="300" height="160" rx="12" fill="#f3d9a4" stroke="#c9a55a" stroke-width="3"/>
  <text x="270" y="205" text-anchor="middle" font-family="Arial" font-size="26" font-weight="bold" fill="#7a5b1e">Main Lodge</text>
  <rect x="520" y="140" width="260" height="130" rx="12" fill="#d9c4ef" stroke="#9a7cc9" stroke-width="3"/>
  <text x="650" y="210" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#5b3d8a">Main Tent</text>
  <rect x="200" y="420" width="280" height="140" rx="12" fill="#c4e3c0" stroke="#6faa68" stroke-width="3"/>
  <text x="340" y="495" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#3c6b36">Lakeside Hall</text>
  <text x="600" y="60" text-anchor="middle" font-family="Arial" font-size="34" font-weight="bold" fill="#2f62b6">RETREATS BY THE LAKE · LAKE WALES, FL</text>
</svg>`;

const EVENT_COVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="480" viewBox="0 0 1200 480">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d3f94"/><stop offset="1" stop-color="#39a9ef"/></linearGradient></defs>
  <rect width="1200" height="480" fill="url(#g)"/>
  <circle cx="980" cy="120" r="150" fill="#f39200" opacity="0.85"/>
  <ellipse cx="600" cy="470" rx="700" ry="120" fill="#a8d4e6" opacity="0.6"/>
  <text x="60" y="400" font-family="Arial" font-size="56" font-weight="bold" fill="#ffffff">WINTER SOLSTICE · LAKE WALES, FL</text>
</svg>`;

const POST_COVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#fff6e1"/>
  <circle cx="400" cy="260" r="170" fill="#f39200" opacity="0.9"/>
  <rect x="0" y="380" width="800" height="220" fill="#2f62b6"/>
  <text x="400" y="500" text-anchor="middle" font-family="Arial" font-size="44" font-weight="bold" fill="#ffffff">Registration open</text>
</svg>`;

const bundle = (version) => ({
  version,
  event,
  program: [
    {
      id: "mock-1",
      date: "2026-12-16",
      day: "Wednesday",
      startTime: version === 1 ? "07:00" : "08:00",
      endTime: version === 1 ? "08:30" : "09:30",
      title: "Morning Sadhana",
      category: "cat-1",
      location: version === 1 ? "Main Tent" : "Lakeside Hall",
      facilitator: "Mock Teacher",
      description: `Bundle version ${version}.`,
    },
  ],
  teachers: [
    {
      id: "t-mock",
      name: "Mock Teacher",
      facilitatorNames: ["Mock Teacher"],
      bio: "",
      photo: version === 1 ? undefined : "http://localhost:3999/photos/mock-teacher.png",
    },
  ],
  venues: [
    { id: "v-1", name: "Main Tent", description: "Main program shelter by the lake." },
    { id: "v-2", name: "Lakeside Hall", description: "Indoor hall next to the dining area." },
  ],
  categories: [{ id: "cat-1", name: "Sadhana" }],
  infoPages: [
    {
      id: "wsol-arrival",
      title: "Arrival & Check-in",
      content: "Check-in opens at 2 PM at the main lodge. Bring your ticket QR code and a photo ID.\n\nParking is next to the lodge.\n\n∙ Follow the volunteers' directions\n∙ Keep your wristband on for the whole event\n∙ Quiet hours start at 10 PM",
    },
    {
      id: "wsol-what-to-bring",
      title: "What to Bring",
      content: "Florida evenings can be cool in December.\n\n∙ Yoga mat and meditation cushion\n∙ Warm layer for early Sadhana\n∙ Reusable water bottle\n∙ Flashlight or headlamp",
    },
  ],
  menus: [
    { id: "menu-2026-12-16-breakfast", date: "2026-12-16", meal: "breakfast", title: "Solstice morning", items: ["Oatmeal with dates", "Yogi tea", "Fresh fruit"], notes: "Vegan · gluten-free option" },
    { id: "menu-2026-12-16-lunch", date: "2026-12-16", meal: "lunch", items: ["Kitcheree", "Steamed greens", "Golden milk"], notes: "Vegan" },
    { id: "menu-2026-12-16-dinner", date: "2026-12-16", meal: "dinner", items: ["Vegetable soup", "Corn bread", "Herbal tea"] },
    { id: "menu-2026-12-17-breakfast", date: "2026-12-17", meal: "breakfast", items: ["Granola", "Almond milk", "Bananas"], notes: "Vegan" },
  ],
});

const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

// --- Messaging 3a mock (exact shapes from class-ssa-messages.php) ---
const channels = [
  { id: 101, type: "official", name: "Announcements" },
  { id: 102, type: "alert", name: "Alerts" },
];
const messages = [
  { id: 1, channelId: 101, kind: "text", body: "Welcome to Winter Solstice! Gates open at 2 PM. Check in at the main lodge.", authorName: "Solstice Team", createdAt: "2026-08-26T14:00:00+00:00" },
  { id: 2, channelId: 102, kind: "alert", body: "Weather advisory: strong winds expected tonight. Please secure loose items around your cabin.", authorName: "Site Crew", createdAt: "2026-08-26T15:30:00+00:00" },
];
let nextMessageId = 3;

createServer((req, res) => {
  const url = new URL(req.url, "http://localhost:3999");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (url.pathname === "/mock/post") {
    const type = url.searchParams.get("type") === "official" ? "official" : "alert";
    const channel = channels.find((c) => c.type === type);
    const message = {
      id: nextMessageId++,
      channelId: channel.id,
      kind: type === "alert" ? "alert" : "text",
      body: url.searchParams.get("body") || "(empty)",
      authorName: "Solstice Team",
      createdAt: new Date().toISOString(),
    };
    messages.push(message);
    console.log(`mock/post -> #${message.id} [${type}] ${message.body.slice(0, 40)}`);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(message));
    return;
  }

  // The event the app should be showing. Same rule the plugin endpoint must
  // implement: an event in progress wins, then the next one to start, then the
  // most recently finished.
  if (url.pathname === "/wp-json/3ho-solstice/v1/events/current") {
    const today = new Date().toISOString().slice(0, 10);
    const candidates = [];

    for (const file of readdirSync(FIXTURES_DIR)) {
      if (!file.endsWith(".json") || file === "home.json") continue;
      const fixture = loadFixture(file.replace(/\.json$/, ""));
      if (fixture?.event?.slug && fixture.event.status !== "archived") candidates.push(fixture.event);
    }

    candidates.sort((a, b) => {
      const rank = (e) => {
        if (e.startDate <= today && (e.endDate ?? e.startDate) >= today) return 0; // en curso
        if (e.startDate > today) return 1;                                          // próximo
        return 2;                                                                   // pasado
      };
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      // Entre próximos gana el más cercano; entre pasados, el más reciente.
      return rank(a) === 2
        ? (b.endDate ?? "").localeCompare(a.endDate ?? "")
        : (a.startDate ?? "").localeCompare(b.startDate ?? "");
    });

    const current = candidates[0];
    console.log(`events/current -> ${current ? current.slug : "(none)"}`);
    res.writeHead(current ? 200 : 404, { "Content-Type": "application/json" });
    res.end(JSON.stringify(current ? { ok: true, ...current } : { ok: false, error: "no_event" }));
    return;
  }

  // The Home feed: events catalog + staff posts. Events come from every fixture
  // (same non-archived rule as /events/current) merged with the catalog-only
  // fields in home.json; a home.json slug with no bundle fixture (the built-in
  // Summer Solstice) is listed from home.json alone. Posts come from home.json.
  if (url.pathname === "/wp-json/3ho-solstice/v1/home") {
    const home = loadFixture("home") ?? { events: {}, posts: [] };
    const extras = home.events ?? {};
    const events = new Map();

    for (const file of readdirSync(FIXTURES_DIR)) {
      if (!file.endsWith(".json") || file === "home.json") continue;
      const fixture = loadFixture(file.replace(/\.json$/, ""));
      const event = fixture?.event;
      if (!event?.slug || event.status === "archived") continue;
      const catalog = { ...event, ...(extras[event.slug] ?? {}), version: Number(fixture.version ?? 1) };
      delete catalog.mapImage; // bundle-only field; the catalog carries `cover` instead
      events.set(event.slug, catalog);
    }
    for (const [slug, extra] of Object.entries(extras)) {
      if (!events.has(slug) && extra?.name) events.set(slug, { slug, ...extra });
    }

    const list = Array.from(events.values()).sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""));
    const posts = Array.isArray(home.posts) ? home.posts : [];
    console.log(`home -> ${list.length} events, ${posts.length} posts`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, generatedAt: new Date().toISOString(), events: list, posts }));
    return;
  }

  const updatesEvent = url.searchParams.get("event") ?? "";
  const knownEvent = updatesEvent === "mocktest" || Boolean(loadFixture(updatesEvent));

  if (url.pathname === "/wp-json/3ho-solstice/v1/updates" && knownEvent) {
    const since = Number(url.searchParams.get("since") ?? "0");
    let cursor = since;
    const payload = channels.map((channel) => {
      const own = messages.filter((m) => m.channelId === channel.id);
      const lastMessageId = own.length ? own[own.length - 1].id : 0;
      cursor = Math.max(cursor, lastMessageId);
      return { id: channel.id, type: channel.type, name: channel.name, lastMessageId, newCount: own.filter((m) => m.id > since).length };
    });
    console.log(`updates since=${since} -> cursor ${cursor}`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, cursor, contentVersion: 2, channels: payload }));
    return;
  }

  const historyMatch = url.pathname.match(/^\/wp-json\/3ho-solstice\/v1\/channels\/(\d+)\/messages$/);
  if (historyMatch) {
    const channel = channels.find((c) => c.id === Number(historyMatch[1]));
    if (!channel) { res.writeHead(404); res.end("{}"); return; }
    const since = Number(url.searchParams.get("since") ?? "0");
    const own = messages.filter((m) => m.channelId === channel.id && m.id > since);
    const body = {
      ok: true,
      channel: { id: channel.id, type: channel.type, name: channel.name },
      messages: own.map(({ id, kind, body: text, authorName, createdAt }) => ({ id, kind, body: text, authorName, createdAt })),
      cursor: own.length ? own[own.length - 1].id : since,
    };
    console.log(`messages ch=${channel.id} since=${since} -> ${own.length}`);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
    return;
  }

  if (url.pathname === "/photos/venue-map.svg") {
    res.writeHead(200, { "Content-Type": "image/svg+xml" });
    res.end(MAP_SVG);
    return;
  }

  if (url.pathname === "/photos/wsol26-map.jpg") {
    try {
      const jpg = readFileSync(WSOL26_MAP_JPG);
      res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=60" });
      res.end(jpg);
    } catch {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "map artwork not found in references/" }));
    }
    return;
  }

  if (url.pathname === "/photos/event-cover.svg") {
    res.writeHead(200, { "Content-Type": "image/svg+xml" });
    res.end(EVENT_COVER_SVG);
    return;
  }

  if (url.pathname === "/photos/post-cover.svg") {
    res.writeHead(200, { "Content-Type": "image/svg+xml" });
    res.end(POST_COVER_SVG);
    return;
  }

  if (url.pathname === "/photos/mock-teacher.png") {
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(PNG_1PX);
    return;
  }

  if (url.pathname === "/wp-json/3ho-solstice/v1/sync") {
    const slug = url.searchParams.get("event") ?? "";
    const since = Number(url.searchParams.get("since") ?? "0");

    if (slug === "mocktest") {
      const body = since >= 2 ? { unchanged: true, version: 2 } : bundle(since >= 1 ? 2 : 1);
      console.log(`sync mocktest since=${url.searchParams.get("since") ?? "(none)"} -> ${body.unchanged ? "unchanged" : `v${body.version}`}`);
      res.writeHead(200, { "Content-Type": "application/json", ETag: `"mock-${body.version}"` });
      res.end(JSON.stringify(body));
      return;
    }

    const fixture = loadFixture(slug);
    if (fixture) {
      const version = Number(fixture.version ?? 1);
      const body = since >= version ? { unchanged: true, version } : fixture;
      console.log(`sync ${slug} since=${url.searchParams.get("since") ?? "(none)"} -> ${body.unchanged ? "unchanged" : `v${version} (${fixture.program?.length ?? 0} sessions)`}`);
      res.writeHead(200, { "Content-Type": "application/json", ETag: `"${slug}-${version}"` });
      res.end(JSON.stringify(body));
      return;
    }

    console.log(`sync ${slug} -> unknown_event`);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "unknown_event", message: "Event not found." }));
    return;
  }

  res.writeHead(404);
  res.end("not found");
}).listen(3999, () => console.log("mock sync server on http://localhost:3999"));
