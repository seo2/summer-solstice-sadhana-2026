// Real app captures for the tutorial. Usage: node scripts/capture.mjs <profileDir> [only,shots]
import { createRequire } from "node:module";
import { writeFileSync, appendFileSync } from "node:fs";
const puppeteer = createRequire("/Users/Seo2_1/.npm/_npx/702923228c2ce1e6/node_modules/x.js")("puppeteer-core");
const exe = "/Users/Seo2_1/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const BASE = process.env.BASE || "http://localhost:3015";
const only = process.argv[3] ? new Set(process.argv[3].split(",")) : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: exe, headless: true, userDataDir: process.argv[2] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
writeFileSync("assets/shots/log.txt", "");
const css = "nextjs-portal,[data-nextjs-toast],[data-nextjs-dev-tools-button],#__next-build-watcher{display:none!important}";
const text = () => page.evaluate(() => document.body.innerText);
const RECTS = {};
const rectsOf = (sel, src) => page.evaluate((sel, src) => {
  const r = src ? new RegExp(src, "i") : null;
  return [...document.querySelectorAll(sel)].filter((e) => !e.closest(".filter-mini-strip")).filter((e) => !r || r.test(e.textContent.trim()) || r.test(e.getAttribute("aria-label") || ""))
    .map((e) => e.getBoundingClientRect()).filter((b) => b.width > 0 && b.bottom > 0 && b.top < innerHeight)
    .map((b) => [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]);
}, sel, src ? src.source : null);
const shot = async (n, marks = {}) => {
  await page.addStyleTag({ content: css });
  await page.evaluate(() => {
    document.querySelectorAll("button").forEach((b) => { if (/^(dismiss|close)$/i.test((b.getAttribute("aria-label") || "").trim()) && /Offline content ready/i.test(b.parentElement?.textContent || "")) b.click(); });
    [...document.querySelectorAll("div,p,span")].filter((e) => /^Offline content ready on this device\.?$/i.test(e.textContent.trim())).forEach((e) => { const box = e.closest("[role=status],[class*=fixed]") || e.parentElement; box.style.display = "none"; });
    [...document.querySelectorAll("a,section,article")].filter((e) => /^SAMPLE/i.test((e.innerText || "").trim()) && e.innerText.length < 500).forEach((e) => (e.style.display = "none"));
  });
  await sleep(700);
  const t = await text();
  if (/Ram Das Puri|Jun 1\d/.test(t)) console.log("WARN summer text visible in", n);
  RECTS[n] = {};
  for (const [k, [sel, re]] of Object.entries(marks)) RECTS[n][k] = await rectsOf(sel, re);
  await page.screenshot({ path: `assets/shots/${n}.png` });
  appendFileSync("assets/shots/log.txt", `\n===== ${n}\n${t.slice(0, 1200)}\n`);
  console.log("shot", n);
};
const pinWinter = () => page.evaluate(() => new Promise((res) => { const r = indexedDB.open("solstice-event-store"); r.onsuccess = () => { const tx = r.result.transaction("settings", "readwrite"); const st = tx.objectStore("settings"); st.put({ key: "active-event", value: "winter-solstice-2026" }); st.put({ key: "active-event-source", value: "manual" }); tx.oncomplete = () => res(true); }; r.onerror = () => res(false); }));
const BUILTIN = /Jun 19|June 19|Adi Shakti|Ram Das Puri|Menus not published|Summer Solstice Sadhana|SUMMER SOLSTICE|Chardi Kala/i;
let reloads = 0;
const go = async (p, re = /Winter Solstice|Program|Thursday|Map|Info/i, builtin = BUILTIN) => {
  for (let attempt = 0; attempt < 6; attempt++) {
    await pinWinter();
    await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
    for (let i = 0; i < 15; i++) { await sleep(800); const t = await text(); if (re.test(t) && !/Preparing offline content/.test(t) && !builtin.test(t)) { await sleep(2000); return; } }
    reloads++; console.log("reload (built-in content shown)", p);
  }
  throw new Error("winter content never shown on " + p);
};
const click = (src, sel = "a,button,summary,[role=button]") => page.evaluate((src, sel) => {
  const r = new RegExp(src, "i");
  const e = [...document.querySelectorAll(sel)].filter((x) => !x.closest(".filter-mini-strip") || window.__mini).find((x) => (r.test(x.textContent.trim()) || r.test(x.getAttribute("aria-label") || "")));
  if (e) { e.scrollIntoView({ block: "center" }); e.click(); }
  return !!e;
}, src.source, sel);
const scrollTo = (src, off = 150) => page.evaluate((src, off) => {
  const r = new RegExp(src, "i");
  const e = [...document.querySelectorAll("h1,h2,h3,p,div,span")].find((x) => x.children.length < 3 && r.test(x.textContent.trim()));
  if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - off);
  return !!e;
}, src.source, off);
const dismissNotice = () => page.evaluate(() => { const h = [...document.querySelectorAll("p,h2,h3,span,strong")].find((e) => /^Schedule subject to change$/i.test(e.textContent.trim())); const box = h?.closest("section,div[class*=rounded]"); const b = box?.querySelector("button"); b?.click(); return !!b; });
const want = (n) => !only || only.has(n);

// 1. splash while the offline content loads (fresh profile only)
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await sleep(2500);
if (want("00-splash") && /Preparing offline content/.test(await text())) await shot("00-splash");
for (let i = 0; i < 120; i++) { if (!/Preparing offline content/.test(await text())) break; await sleep(2000); }
await sleep(3000);

if (want("01-apphome")) { await page.evaluate(() => window.scrollTo(0, 0)); await shot("01-apphome"); }
// adopt the winter event before anything else
if (process.env.ADOPT) { await click(/^Continue/); await sleep(5000); }
console.log("after continue:", page.url());
if (want("01b-apphome")) { await go("/", /UPCOMING/i, /^$/); await page.evaluate(() => window.scrollTo(0, 0)); await click(/^Dismiss install hint$/); await sleep(800); await shot("01b-apphome", { cont: ["button,a", /^Continue/] }); }
if (want("02-event")) { await go("/event"); await page.evaluate(() => window.scrollTo(0, 0)); await shot("02-event", { nav: ["nav a"] });
  await page.evaluate(() => window.scrollTo(0, 520)); await shot("02b-event-tiles"); }

if (want("03-program")) {
  await go("/program", /December|Dec 1\d/);
  console.log("notice dismissed", await dismissNotice()); await sleep(800);
  await page.evaluate(() => window.scrollTo(0, 0)); await shot("03-program-top", { wed: ["button", /^Wed, Dec 16$/] });
  console.log("wed", await click(/^Wed, Dec 16$/)); await sleep(1800);
  await shot("03b-program-thu");
  await page.evaluate(() => window.scrollBy(0, 900)); await sleep(1200);
  await shot("03c-program-compact");
}
if (want("04-search")) {
  await go("/program", /December|Dec 1\d/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.focus('input[placeholder^="Search"]'); await page.keyboard.type("Gong", { delay: 60 }); await sleep(1500);
  await shot("04-search", { search: ["input[placeholder^=Search]"] });
  await page.evaluate(() => { const i = document.querySelector('input[placeholder^="Search"]'); const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; s.call(i, ""); i.dispatchEvent(new Event("input", { bubbles: true })); });
  await sleep(800);
  await click(/Advanced filters/); await sleep(1000);
  await click(/^Morning/); await sleep(1000);
  await page.evaluate(() => window.scrollTo(0, 250)); await sleep(800);
  await shot("04b-advanced", { morning: ["button", /^Morning/], adv: ["button", /Advanced filters/] });
}
if (want("05-detail")) {
  await go("/program", /December|Dec 1\d/);
  await click(/^Tue, Dec 15$/); await sleep(1500);
  const ok = await page.evaluate(() => { const a = [...document.querySelectorAll("article")].find((x) => /Opening Ceremony/i.test(x.textContent)); const c = a?.querySelector("button"); if (c) { window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY - 300); c.click(); } return c ? c.textContent.slice(0, 80) : null; });
  console.log("detail opened:", ok); await sleep(2000);
  await shot("05-detail", { fav: ["button", /^Favorite$/] });
}
if (want("06-favorites")) {
  await go("/program", /December|Dec 1\d/);
  await page.evaluate(() => { const h = [...document.querySelectorAll("*")].filter((e) => /^Wednesday, December 16/.test((e.textContent || "").trim()) && e.textContent.length < 60).pop(); window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 200); }); await sleep(1200);
  await page.evaluate(() => [...document.querySelectorAll('button[aria-label="Toggle favorite"]')].filter((b) => b.className.includes("bg-rose-500")).forEach((b) => b.click())); await sleep(1200);
  await shot("06-hearts-before", { hearts: ["button[aria-label='Toggle favorite']"] });
  await page.evaluate(() => { const bs = [...document.querySelectorAll('button[aria-label="Toggle favorite"]')].filter((b) => !b.className.includes("bg-rose-500")).filter((b) => { const r = b.getBoundingClientRect(); return r.top > 120 && r.bottom < window.innerHeight - 90; }); bs.slice(0, 3).forEach((b) => b.click()); });
  await sleep(1200);
  await shot("06b-hearts-after");
  await go("/favorites", /Morning Sadhana/); await sleep(1500); await page.evaluate(() => window.scrollTo(0, 0)); await sleep(800); await page.evaluate(() => window.scrollTo(0, 330)); await sleep(1000);
  await shot("06c-favorites");
}
if (want("07-teachers")) {
  await go("/teachers", /Amrit Kirtan Kaur/); await page.evaluate(() => window.scrollTo(0, 0)); await shot("07-teachers", { amrit: ["button", /Amrit Kirtan Kaur/] });
  for (let i = 0; i < 10 && !(await click(/Amrit Kirtan Kaur/, "button")); i++) await sleep(1000);
  await sleep(1800); console.log("teacher modal", /Kirtan singer/.test(await text())); await shot("07b-teacher");
}
if (want("08-menus")) { await go("/menus", /Yogi Tea/); await page.evaluate(() => window.scrollTo(0, 0)); await shot("08-menus"); }
if (want("09-info")) { await go("/info", /Info/); await page.evaluate(() => window.scrollTo(0, 0)); await shot("09-info");
  await page.evaluate(() => { const a = document.querySelector("a[href='/install']"); window.scrollTo(0, a.getBoundingClientRect().bottom + window.scrollY - 70); }); await shot("09b-info-groups"); }
if (want("10-map")) {
  await go("/map", /Map/);
  for (let i = 0; i < 20; i++) { if (/TIGER|Overview/i.test(await text())) break; await sleep(1000); }
  await click(/overview/); await sleep(1000);
  await shot("10-map", { zin: ["button", /Zoom in map/] });
  for (let i = 0; i < 3; i++) { await click(/Zoom in map/); await sleep(350); }
  await sleep(800); await shot("10b-map-zoom", { asta: ["button", /^Show ASTA on map$/] });
  const chip = await click(/^Show ASTA on map$/, "button");
  console.log("chip", chip); await sleep(1800); await shot("10c-map-venue");
}
if (want("11-announcements")) { await go("/announcements", /Announcements/); await page.evaluate(() => window.scrollTo(0, 0)); await shot("11-announcements", { bell: ["a,button", /^Announcements/] });
  await scrollTo(/Notifications/, 200); await shot("11b-notifications", { alerts: ["button,[role=switch],input", /Event alerts/] }); }
if (want("12-contact")) { await go("/contact", /Contact|Message/i); await page.evaluate(() => window.scrollTo(0, 0)); await shot("12-contact"); }
const fs = await import("node:fs");
const prev = fs.existsSync("assets/shots/rects.json") ? JSON.parse(fs.readFileSync("assets/shots/rects.json", "utf8")) : {};
fs.writeFileSync("assets/shots/rects.json", JSON.stringify(Object.assign(prev, RECTS), null, 1));
console.log("reloads", reloads);
await browser.close();
