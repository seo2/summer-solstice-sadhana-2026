import { createRequire } from "node:module";
const puppeteer = createRequire("/Users/Seo2_1/.npm/_npx/702923228c2ce1e6/node_modules/x.js")("puppeteer-core");
const exe = "/Users/Seo2_1/.cache/puppeteer/chrome-headless-shell/mac_arm-151.0.7922.77/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const BASE = "http://localhost:3012";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: exe, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const css = "nextjs-portal,[data-nextjs-toast],[data-nextjs-dev-tools-button]{display:none!important}";
const clean = async () => {
  await page.addStyleTag({ content: css });
  await page.evaluate(() => {
    document.querySelectorAll("button").forEach((b) => { if (/dismiss|close/i.test(b.getAttribute("aria-label") || "")) b.click(); });
  });
};
const shot = async (n) => { await clean(); await sleep(400); const t = await page.evaluate(() => document.body.innerText); if (/Jun 1\d|Ram Das Puri/.test(t)) console.log("WARN summer text in", n); await page.screenshot({ path: `assets/${n}.png` }); console.log("shot", n); };
const go = async (p) => {
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      const t = await page.evaluate(() => document.body.innerText);
      if (/Winter Solstice/i.test(t) && !/Jun 1\d|Ram Das Puri/i.test(t)) { await sleep(2500); return; }
    }
    console.log("retry", p);
  }
  throw new Error("winter event not shown on " + p);
};
const click = (re) => page.evaluate((src) => { const r = new RegExp(src, "i"); const e = [...document.querySelectorAll("a,button,summary")].find((x) => r.test(x.textContent.trim())); e?.click(); return !!e; }, re.source);

await page.goto(BASE + "/", { waitUntil: "networkidle2" });
for (let i = 0; i < 60; i++) { const t = await page.evaluate(() => document.body.innerText); if (!t.includes("Preparing offline content")) break; await sleep(2000); }
await sleep(2500);
await click(/^continue/);
await sleep(4000);
await page.evaluate(() => { [...document.querySelectorAll("a,section,div")].filter((e) => /^SAMPLE/i.test(e.innerText || "") && e.innerText.length < 400).forEach((e) => (e.style.display = "none")); window.scrollTo(0, 0); });
await shot("01-event");

await go("/program");
await shot("02-program-top");
await click(/^Thu, Dec 17$/); await sleep(1500);
await page.evaluate(() => { const h = [...document.querySelectorAll("h2,h3")].find((e) => /Thursday/i.test(e.textContent)); h?.scrollIntoView({ block: "start" }); window.scrollBy(0, -170); });
await sleep(800);
await shot("03-program-day");
// favorite sessions: frame the Thursday list first, then heart without scrolling
await page.evaluate(() => { const h = document.querySelector('button[aria-label*="avorite" i], button[aria-label*="save" i]'); const y = h.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, y - 190); });
await sleep(1200);
await shot("03b-program-thu");
const n = await page.evaluate(() => { const bs = [...document.querySelectorAll('button[aria-label*="avorite" i], button[aria-label*="save" i]')].filter((b) => { const r = b.getBoundingClientRect(); return r.top > 0 && r.bottom < window.innerHeight - 80; }); bs.slice(0, 3).forEach((b) => b.click()); return bs.length; });
console.log("visible hearts", n);
await sleep(1200);
await shot("04-program-hearts");
await go("/favorites");
await page.evaluate(() => { const h = [...document.querySelectorAll("h2,h3,p,div")].find((e) => /^Thursday, December 17$/i.test(e.textContent.trim())); h?.scrollIntoView({ block: "start" }); window.scrollBy(0, -150); });
await sleep(800);
await shot("05-favorites");
await go("/info");
await page.evaluate(() => window.scrollTo(0, 0));
await shot("06-info");
await page.evaluate(() => window.scrollTo(0, 480)); await sleep(500);
await shot("07-info-groups");
await go("/map");
for (let i = 0; i < 20; i++) { if ((await page.evaluate(() => document.body.innerText)).includes("TIGER")) break; await sleep(1000); }
await click(/overview/); await sleep(800);
await shot("08-map");
for (let i = 0; i < 4; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /zoom in/i.test(x.getAttribute("aria-label") || "")); b?.click(); }); await sleep(300); }
await shot("09-map-zoom");
await page.goto(BASE + "/install", { waitUntil: "domcontentloaded" }); await sleep(6000);
await shot("10-install");
await browser.close();
