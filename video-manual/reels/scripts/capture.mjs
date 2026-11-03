// Real app captures for the launch reels (same approach as ../tutorial/scripts/capture.mjs).
// Usage, from video-manual/reels: BASE=http://localhost:3017 ADOPT=1 node scripts/capture.mjs <freshProfileDir> [only,shots]
import { createRequire } from "node:module";
import { writeFileSync, appendFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
const puppeteer = createRequire("/Users/Seo2_1/.npm/_npx/702923228c2ce1e6/node_modules/x.js")("puppeteer-core");
const exe = "/Users/Seo2_1/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const BASE = process.env.BASE || "http://localhost:3017";
const only = process.argv[3] ? new Set(process.argv[3].split(",")) : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync("shots", { recursive: true });
const browser = await puppeteer.launch({ executablePath: exe, headless: true, userDataDir: process.argv[2] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
writeFileSync("shots/log.txt", "");
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
  await page.screenshot({ path: `shots/${n}.png` });
  appendFileSync("shots/log.txt", `\n===== ${n}\n${t.slice(0, 1200)}\n`);
  console.log("shot", n);
};
const pinWinter = () => page.evaluate(() => new Promise((res) => { const r = indexedDB.open("solstice-event-store"); r.onsuccess = () => { const tx = r.result.transaction("settings", "readwrite"); const st = tx.objectStore("settings"); st.put({ key: "active-event", value: "winter-solstice-2026" }); st.put({ key: "active-event-source", value: "manual" }); tx.oncomplete = () => res(true); }; r.onerror = () => res(false); }));
const BUILTIN = /Jun 19|June 19|Adi Shakti|Ram Das Puri|Menus not published|Summer Solstice Sadhana|SUMMER SOLSTICE|Chardi Kala/i;
const go = async (p, re = /Winter Solstice|Program|Thursday|Map|Info/i) => {
  for (let attempt = 0; attempt < 6; attempt++) {
    await pinWinter();
    await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
    for (let i = 0; i < 15; i++) { await sleep(800); const t = await text(); if (re.test(t) && !/Preparing offline content/.test(t) && !BUILTIN.test(t)) { await sleep(2000); return; } }
    console.log("reload (built-in content shown)", p);
  }
  throw new Error("winter content never shown on " + p);
};
const click = (src, sel = "a,button,summary,[role=button]") => page.evaluate((src, sel) => {
  const r = new RegExp(src, "i");
  const e = [...document.querySelectorAll(sel)].filter((x) => !x.closest(".filter-mini-strip")).find((x) => (r.test(x.textContent.trim()) || r.test(x.getAttribute("aria-label") || "")));
  if (e) { e.scrollIntoView({ block: "center" }); e.click(); }
  return !!e;
}, src.source, sel);
const dismissNotice = () => page.evaluate(() => { const h = [...document.querySelectorAll("p,h2,h3,span,strong")].find((e) => /^Schedule subject to change$/i.test(e.textContent.trim())); const box = h?.closest("section,div[class*=rounded]"); const b = box?.querySelector("button"); b?.click(); return !!b; });
// set a native <select> whose first option reads `first` to the option matching `re`
const pick = (first, re) => page.evaluate((first, re) => {
  const s = [...document.querySelectorAll("select")].find((x) => x.options[0]?.textContent.trim() === first);
  const o = s && [...s.options].find((x) => new RegExp(re, "i").test(x.textContent));
  if (!o) return null;
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(s, o.value);
  s.dispatchEvent(new Event("change", { bubbles: true }));
  return o.textContent;
}, first, re.source);
const want = (n) => !only || only.has(n);

await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await sleep(2500);
for (let i = 0; i < 120; i++) { if (!/Preparing offline content/.test(await text())) break; await sleep(2000); }
await sleep(3000);
if (process.env.ADOPT) { await click(/^Continue/); await sleep(5000); }

if (want("event")) { await go("/event"); await page.evaluate(() => window.scrollTo(0, 0)); await shot("event", { nav: ["nav a"] }); }
if (want("program")) {
  await go("/program", /December|Dec 1\d/);
  console.log("notice dismissed", await dismissNotice()); await sleep(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot("program-top", { wed: ["button", /^Wed, Dec 16$/], venue: ["select", /^Venue/], category: ["select", /^Category/] });
  console.log("wed", await click(/^Wed, Dec 16$/)); await sleep(1800);
  await shot("program-wed");
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(600);
  console.log("venue", await pick("Venue", /TANTRIC/)); await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(600);
  await shot("program-venue", { venue: ["select", /TANTRIC/] });
}
if (want("favorites")) {
  await go("/program", /December|Dec 1\d/);
  await page.evaluate(() => { const h = [...document.querySelectorAll("*")].filter((e) => /^Wednesday, December 16/.test((e.textContent || "").trim()) && e.textContent.length < 60).pop(); window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 200); }); await sleep(1200);
  await page.evaluate(() => [...document.querySelectorAll('button[aria-label="Toggle favorite"]')].filter((b) => b.className.includes("bg-rose-500")).forEach((b) => b.click())); await sleep(1200);
  await shot("hearts-before", { hearts: ["button[aria-label='Toggle favorite']"] });
  await page.evaluate(() => { const bs = [...document.querySelectorAll('button[aria-label="Toggle favorite"]')].filter((b) => !b.className.includes("bg-rose-500")).filter((b) => { const r = b.getBoundingClientRect(); return r.top > 120 && r.bottom < window.innerHeight - 90; }); bs.slice(0, 2).forEach((b) => b.click()); });
  await sleep(1200);
  await shot("hearts-after");
  await go("/favorites", /Aquarian Sadhana/); await sleep(1500);
  // both saved sessions in view: Wednesday's header just under the app header
  await page.evaluate(() => { const h = [...document.querySelectorAll("*")].filter((e) => /^Wednesday, December 16/.test((e.textContent || "").trim()) && e.textContent.length < 60).pop(); window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 130); }); await sleep(1200);
  await shot("favorites");
}
if (want("info")) { await go("/info", /Info/); await page.evaluate(() => window.scrollTo(0, 0)); await shot("info");
  // groups only: the "Add app to Home Screen" (web install) link stays above the frame
  await page.evaluate(() => { const a = document.querySelector("a[href='/install']"); window.scrollTo(0, a.getBoundingClientRect().bottom + window.scrollY - 70); }); await sleep(800); await shot("info-groups"); }
if (want("map")) {
  await go("/map", /Map/);
  for (let i = 0; i < 20; i++) { if (/TIGER|Overview/i.test(await text())) break; await sleep(1000); }
  await click(/overview/); await sleep(1000);
  await shot("map", { zin: ["button", /Zoom in map/] });
  for (let i = 0; i < 3; i++) { await click(/Zoom in map/); await sleep(350); }
  await sleep(800); await shot("map-zoom", { asta: ["button", /^Show ASTA on map$/] });
  console.log("chip", await click(/^Show ASTA on map$/, "button")); await sleep(1800); await shot("map-venue");
}
const prev = existsSync("shots/rects.json") ? JSON.parse(readFileSync("shots/rects.json", "utf8")) : {};
writeFileSync("shots/rects.json", JSON.stringify(Object.assign(prev, RECTS), null, 1));
await browser.close();
