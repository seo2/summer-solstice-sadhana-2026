"""Generates the three launch reels (1080x1920) as HyperFrames projects:
reels/01-reveal, reels/02-plan, reels/03-offline. Each gets index.html, compositions/story.html,
compositions/endcard.html and its own copy of the assets it uses.

Sources: shots/*.png + shots/rects.json (scripts/capture.mjs, CSS px of a 390x844 viewport),
../tutorial/assets/fonts, ../assets/audio/music-upbeat.m4a, the iOS app icon.
Times are in beats of the music (115 bpm, B = 0.5215 s); every reel starts the track on the beat
grid and lands its end card on the track's strongest hit (23.48 s into the file).
Rerun after any edit: python3 scripts/build.py"""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # video-manual/reels
REPO = ROOT.parent.parent
RECTS = json.loads((ROOT / "shots/rects.json").read_text())

B = 0.5215          # one beat
HIT = 23.48         # strongest hit in music-upbeat.m4a (file time)
K = 744 / 390       # capture CSS px -> screen px inside the phone
BAND = 690          # top of the area the phone may use (text sits above)
PHONE_X = 160


def b(n):
    return round(n * B, 3)


def cam_y(r):
    """Phone translateY that puts capture row r at the top of the phone band."""
    return round(BAND - 8 - r * K, 1)


def rect(shot, key, i=0):
    x, y, w, h = RECTS[shot][key][i]
    return x * K, y * K, w * K, h * K


# ---------------------------------------------------------------- reels
# caps: (beat, head, sub, theme)   shots: (beat, shot, roi_row)   cams: (beat, roi_row, scale)
# taps: (beat, shot, key, i)   rings: (beat_in, beat_out, shot, key, i)   pops: (beat, shot_after, shot, key, i)
REELS = [
    dict(
        id="01-reveal", title="The Big Reveal", theme="deep", hero=True, end=23, tail=3.2, rise=3,
        kickers=[(0, "3HO · WINTER SOLSTICE 2026")],
        caps=[
            (0, "We have good news!", None, "deep"),
            (3, "The official 3HO Event App is ready.", "Free on the App Store and Google Play", "deep"),
            (8, "Your digital pocket guide", ["Program", "Map", "Info", "Favorites"], "deep"),
            (16, "Start preparing for Winter Solstice.", "Dec 15–21, 2026 · Lake Wales, FL", "deep"),
        ],
        shots=[(0, "event", 0), (8, "program-wed", 120), (10, "map", 440), (12, "info-groups", 40),
               (14, "favorites", 230), (16, "event", 0)],
        highlights=[8, 10, 12, 14],
        end_card=dict(kicker="DOWNLOAD NOW"),
    ),
    dict(
        id="02-plan", title="Design Your Experience", theme="light", end=25, tail=3.2, rise=0,
        kickers=[(0, "NEW · 3HO EVENT APP")],
        caps=[
            (0, "Plan your Solstice week with ease.", None, "light"),
            (5, "Browse the full program", "Every session, day by day", "light"),
            (9, "Filter by day, venue or category", None, "light"),
            (15, "Tap the heart to save your favorites", None, "light"),
            (20, "Find them all in Favorites", None, "light"),
        ],
        shots=[(0, "program-top", 0), (5, "program-top", 420), (9, "program-top", 250), (10, "program-wed", 250),
               (12, "program-venue", 250), (15, "hearts-before", 260), (20, "hearts-after", 509),
               (21, "favorites", 230)],
        taps=[(10, "program-top", "wed", 0), (17, "hearts-before", "hearts", 0), (18, "hearts-before", "hearts", 1),
              (21, "event", "nav", 2)],
        rings=[(11, 12.5, "program-top", "venue", 0), (12.5, 14, "program-top", "category", 0)],
        pops=[(17, "hearts-after", "hearts-before", "hearts", 0), (18, "hearts-after", "hearts-before", "hearts", 1)],
        end_card=dict(kicker="DOWNLOAD NOW"),
    ),
    dict(
        id="03-offline", title="Peace of Mind", theme="light", end=26, tail=3.6, rise=0,
        kickers=[(0, "NEW · 3HO EVENT APP"), (13, "SAVED ON YOUR PHONE", "plane")],
        caps=[
            (0, "Everything you need, right in your pocket.", None, "light"),
            (5, "Find every venue on one map", None, "light"),
            (13, "No signal? No problem.", None, "deep"),
            (21, "Open it once on <span class=\"nb\">Wi-Fi</span> before you travel.", None, "deep"),
        ],
        shots=[(0, "map", 430), (6, "map", 510), (7, "map-zoom", 510), (8, "map-zoom", 360), (10, "map-venue", 360),
               (14, "hearts-after", 260), (15, "map", 430), (16, "info-groups", 40), (21, "event", 0)],
        taps=[(7, "map", "zin", 0), (10, "map-zoom", "asta", 0)],
        deep_at=13, tiles=[(14, "Program"), (15, "Map"), (16, "Info")], tiles_out=21,
        end_card=dict(kicker="SEE YOU THERE", event=("Winter Solstice Sadhana 2026", "Dec 15–21 · Lake Wales, FL")),
    ),
]

FONT_CSS = """
      @font-face { font-family: "Geist"; src: url("assets/fonts/geist-latin.woff2") format("woff2"); font-weight: 100 900;
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
      @font-face { font-family: "Geist"; src: url("assets/fonts/geist-latin-ext.woff2") format("woff2"); font-weight: 100 900;
        unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }"""

STORY_CSS = """
      * { margin: 0; padding: 0; box-sizing: border-box; }
      #root { position: absolute; inset: 0; overflow: hidden; font-family: "Geist", ui-sans-serif, system-ui, sans-serif; }
      .bg { position: absolute; inset: 0; }
      .bg-light { background:
          radial-gradient(1100px 760px at 88% -4%, rgba(255, 214, 107, 0.42), rgba(255, 248, 234, 0) 70%),
          radial-gradient(900px 700px at -10% 60%, rgba(57, 169, 239, 0.14), rgba(57, 169, 239, 0) 70%),
          linear-gradient(180deg, #f7fbff 0%, #eaf4ff 100%); }
      .bg-deep { background:
          radial-gradient(1000px 800px at 90% -6%, rgba(57, 169, 239, 0.4), rgba(57, 169, 239, 0) 70%),
          radial-gradient(900px 700px at 0% 105%, rgba(255, 214, 107, 0.16), rgba(255, 214, 107, 0) 70%),
          linear-gradient(160deg, #2f62b6 0%, #1e3f86 100%); }
      .kick { position: absolute; left: 96px; right: 96px; top: 200px; font-weight: 800; font-size: 32px;
        letter-spacing: 0.2em; color: #c57400; display: flex; align-items: center; gap: 16px; }
      .kick.deep { color: #ffd66b; }
      .kick svg { width: 44px; height: 44px; }
      .cap { position: absolute; left: 96px; right: 96px; top: 262px; }
      .head { font-weight: 900; font-size: 96px; line-height: 1.02; letter-spacing: -0.045em; color: #2f62b6; }
      .sub { margin-top: 26px; font-weight: 600; font-size: 42px; line-height: 1.2; color: #374151; }
      .cap.hero { top: 640px; }
      .cap.hero .head { font-size: 156px; line-height: 0.98; }
      .nb { white-space: nowrap; }
      .cap.deep .head { color: #ffffff; }
      .cap.deep .sub { color: rgba(255, 255, 255, 0.88); }
      .sub .w { display: inline-block; color: rgba(255, 255, 255, 0.66); }
      .sub .dot { color: rgba(255, 255, 255, 0.6); padding: 0 12px; }
      .stage { position: absolute; inset: 0;
        -webkit-mask-image: linear-gradient(180deg, transparent 0, transparent 620px, #000 690px);
        mask-image: linear-gradient(180deg, transparent 0, transparent 620px, #000 690px); }
      .cam { position: absolute; inset: 0; transform-origin: 540px 1010px; }
      .phone { position: absolute; left: __PX__px; top: 0; width: 760px; height: __PH__px; padding: 8px;
        background: #111827; border-radius: 104px; box-shadow: 0 44px 120px rgba(30, 63, 134, 0.36); }
      .screen { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 96px; background: #f7fbff; }
      .shot { position: absolute; inset: 0; background-size: 100% 100%; }
      .tap { position: absolute; width: 96px; height: 96px; border-radius: 999px; z-index: 5;
        background: rgba(243, 146, 0, 0.35); border: 5px solid rgba(243, 146, 0, 0.9); opacity: 0; }
      .ring { position: absolute; border: 6px solid #f39200; border-radius: 999px; opacity: 0; z-index: 5; }
      .pop { position: absolute; z-index: 4; background-repeat: no-repeat; border-radius: 999px; opacity: 0; }
      .tiles { position: absolute; left: 96px; right: 96px; top: 492px; display: flex; gap: 20px; }
      .tile { display: flex; align-items: center; gap: 12px; padding: 16px 30px; border-radius: 999px;
        background: rgba(255, 255, 255, 0.14); border: 2px solid rgba(255, 255, 255, 0.34); color: #ffffff;
        font-weight: 900; font-size: 38px; }
      .tile svg { width: 36px; height: 36px; color: #ffd66b; }
""".replace("__PX__", str(PHONE_X)).replace("__PH__", str(round(844 * K + 16)))

END_CSS = """
      * { margin: 0; padding: 0; box-sizing: border-box; }
      #root { position: absolute; inset: 0; overflow: hidden; font-family: "Geist", ui-sans-serif, system-ui, sans-serif; color: #ffffff;
        background:
          radial-gradient(1000px 800px at 90% -6%, rgba(57, 169, 239, 0.4), rgba(57, 169, 239, 0) 70%),
          radial-gradient(900px 700px at 0% 105%, rgba(255, 214, 107, 0.2), rgba(255, 214, 107, 0) 70%),
          linear-gradient(160deg, #2f62b6 0%, #1e3f86 100%); }
      .col { position: absolute; left: 96px; right: 96px; top: 200px; height: 1110px; display: flex; flex-direction: column;
        align-items: center; justify-content: center; text-align: center; }
      .kick { font-weight: 800; font-size: 34px; letter-spacing: 0.2em; color: #ffd66b; }
      .ev { margin-top: 22px; font-weight: 900; font-size: 84px; line-height: 1.02; letter-spacing: -0.045em; }
      .evsub { margin-top: 20px; font-weight: 600; font-size: 40px; color: rgba(255, 255, 255, 0.88); }
      .iconwrap { position: relative; margin-top: 64px; }
      .icon { width: var(--icon); height: var(--icon); border-radius: calc(var(--icon) * 0.225); background: #ffffff;
        overflow: hidden; box-shadow: 0 40px 110px rgba(0, 0, 0, 0.3); }
      .icon img { width: 100%; height: 100%; display: block; }
      .halo { position: absolute; left: 50%; top: 50%; width: var(--icon); height: var(--icon); margin: calc(var(--icon) / -2) 0 0 calc(var(--icon) / -2);
        border-radius: calc(var(--icon) * 0.225); border: 6px solid #ffd66b; opacity: 0; }
      .name { margin-top: 48px; font-weight: 900; font-size: 92px; letter-spacing: -0.045em; line-height: 1; }
      .pills { margin-top: 44px; display: flex; gap: 22px; }
      .pill { background: #ffffff; color: #1e3f86; border-radius: 999px; padding: 20px 38px; font-weight: 900; font-size: 38px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22); }
      .free { margin-top: 30px; font-weight: 600; font-size: 36px; color: rgba(255, 255, 255, 0.8); }
"""

PLANE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>'
CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'


def page(cid, css, body, js, dur):
    return f"""<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>{FONT_CSS}
{css}
      </style>
      <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920" data-duration="{dur}">
{body}
      </div>
      <script>
        const tl = gsap.timeline({{ paused: true }});
        const E = "power3.out";
{js}
        tl.set({{}}, {{}}, {dur});
        window.__timelines["{cid}"] = tl;
      </script>
    </template>
  </body>
</html>
"""


def story(r):
    end = b(r["end"])
    body, js = [], []
    deep_at = r.get("deep_at")
    body.append(f'        <div class="bg bg-{r["theme"]}"></div>')
    if deep_at is not None:
        body.append('        <div id="bgd" class="bg bg-deep" style="opacity:0"></div>')
        js.append(f'tl.to("#bgd", {{ opacity: 1, duration: 0.45, ease: "power1.inOut" }}, {b(deep_at) - 0.2});')

    # kickers
    for i, kk in enumerate(r["kickers"]):
        at, text = kk[0], kk[1]
        theme = "deep" if (r["theme"] == "deep" or (deep_at is not None and at >= deep_at)) else "light"
        icon = PLANE if len(kk) > 2 else ""
        body.append(f'        <div id="k{i}" class="kick {theme}">{icon}<span>{text}</span></div>')
        if i:
            js.append(f'tl.to("#k{i - 1}", {{ opacity: 0, y: -20, duration: 0.25, ease: "power2.in" }}, {b(at) - 0.22});')
            js.append(f'tl.fromTo("#k{i}", {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.45, ease: E }}, {b(at)});')
            js.append(f'tl.fromTo("#k{i} svg", {{ x: -120, rotation: -12 }}, {{ x: 0, rotation: 0, duration: 0.8, ease: E }}, {b(at)});')

    # captions
    caps = r["caps"]
    for i, (at, head, sub, theme) in enumerate(caps):
        if isinstance(sub, list):
            sub_html = '<span class="dot">·</span>'.join(f'<span id="w{j}" class="w">{w}</span>' for j, w in enumerate(sub))
            sub_html = f'<div class="sub">{sub_html}</div>'
        else:
            sub_html = f'<div class="sub">{sub}</div>' if sub else ""
        hero = " hero" if i == 0 and r.get("hero") else ""
        body.append(f'        <div id="c{i}" class="cap {theme}{hero}"><div class="head">{head}</div>{sub_html}</div>')
        if i == 0:
            # the hook is on screen at frame 0 and keeps settling
            js.append('tl.fromTo("#c0", { scale: 0.94, transformOrigin: "0% 50%" }, { scale: 1, duration: 1.3, ease: "power2.out" }, 0);')
        else:
            js.append(f'tl.to("#c{i - 1}", {{ opacity: 0, y: -36, duration: 0.24, ease: "power2.in" }}, {b(at) - 0.22});')
            js.append(f'tl.fromTo("#c{i} .head", {{ opacity: 0, y: 56 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: E }}, {b(at)});')
            if sub_html:
                js.append(f'tl.fromTo("#c{i} .sub", {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: E }}, {b(at) + 0.16});')
    for j, at in enumerate(r.get("highlights", [])):
        if j:
            js.append(f'tl.to("#w{j - 1}", {{ color: "rgba(255,255,255,0.66)", duration: 0.2 }}, {b(at)});')
        js.append(f'tl.to("#w{j}", {{ color: "#ffd66b", duration: 0.2 }}, {b(at)});')
        js.append(f'tl.fromTo("#w{j}", {{ y: 0 }}, {{ y: -6, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }}, {b(at)});')

    # tiles (offline beat)
    if r.get("tiles"):
        body.append('        <div id="tiles" class="tiles">' + "".join(f'<span id="t{i}" class="tile">{CHECK}{w}</span>' for i, (_, w) in enumerate(r["tiles"])) + "</div>")
        for i, (at, _) in enumerate(r["tiles"]):
            js.append(f'tl.fromTo("#t{i}", {{ opacity: 0, y: 30, scale: 0.8 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(2.2)" }}, {b(at)});')
        js.append(f'tl.to("#tiles", {{ opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }}, {b(r["tiles_out"]) - 0.22});')

    # the phone: shots, camera, taps, rings, pops
    names = []
    for _, s, _ in r["shots"]:
        if s not in names:
            names.append(s)
    layers = "".join(f'<div id="s-{s}" class="shot" style="background-image:url(assets/shots/{s}.png);opacity:{1 if s == r["shots"][0][1] else 0}"></div>' for s in names)
    marks = []
    for j, (at, shot, key, i) in enumerate(r.get("taps", [])):
        x, y, w, h = rect(shot, key, i)
        marks.append(f'<div id="tap{j}" class="tap" style="left:{x + w / 2 - 48:.0f}px;top:{y + h / 2 - 48:.0f}px"></div>')
        js.append(f'tl.fromTo("#tap{j}", {{ opacity: 0, scale: 0.5 }}, {{ opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }}, {b(at) - 0.36});')
        js.append(f'tl.to("#tap{j}", {{ opacity: 0, scale: 1.8, duration: 0.4, ease: "power2.out" }}, {b(at)});')
    for j, (t0, t1, shot, key, i) in enumerate(r.get("rings", [])):
        x, y, w, h = rect(shot, key, i)
        pad = 10
        marks.append(f'<div id="ring{j}" class="ring" style="left:{x - pad:.0f}px;top:{y - pad:.0f}px;width:{w + 2 * pad:.0f}px;height:{h + 2 * pad:.0f}px;border-radius:{min(h + 2 * pad, 44):.0f}px"></div>')
        js.append(f'tl.fromTo("#ring{j}", {{ opacity: 0, scale: 1.2 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }}, {b(t0)});')
        js.append(f'tl.to("#ring{j}", {{ opacity: 0, duration: 0.22 }}, {b(t1) - 0.24});')
    for j, (at, after, shot, key, i) in enumerate(r.get("pops", [])):
        x, y, w, h = rect(shot, key, i)
        pad = 4
        marks.append(f'<div id="pop{j}" class="pop" style="left:{x - pad:.0f}px;top:{y - pad:.0f}px;width:{w + 2 * pad:.0f}px;height:{h + 2 * pad:.0f}px;'
                     f'background-image:url(assets/shots/{after}.png);background-size:744px auto;background-position:{-(x - pad):.0f}px {-(y - pad):.0f}px"></div>')
        js.append(f'tl.fromTo("#pop{j}", {{ opacity: 0, scale: 0.4 }}, {{ opacity: 1, scale: 1, duration: 0.42, ease: "back.out(3)" }}, {b(at)});')
        if after not in names:
            names.append(after)
    # the phone sits under the text: its top is masked away above the band anyway
    body.insert(2 if deep_at is not None else 1, f'        <div class="stage" data-layout-allow-overflow><div id="cam" class="cam"><div id="phone" class="phone" data-layout-allow-overflow><div class="screen">{layers}{"".join(marks)}</div></div></div></div>')

    first_row = r["shots"][0][2]
    rise_at = b(r["rise"])
    # a reel that opens on the phone already shows its top at frame 0
    start_y = 1960 if r["rise"] else cam_y(first_row) + 560
    js.append(f'tl.fromTo("#phone", {{ y: {start_y} }}, {{ y: {cam_y(first_row)}, duration: 0.9, ease: "power4.out" }}, {max(rise_at - 0.25, 0)});')
    shown, row = r["shots"][0][1], first_row
    for at, s, rr in r["shots"][1:]:
        t = b(at)
        if s != shown:
            js.append(f'tl.to("#s-{s}", {{ opacity: 1, duration: 0.2, ease: "none" }}, {t - 0.1});')
            js.append(f'tl.set("#s-{shown}", {{ opacity: 0 }}, {t + 0.1});')
            # pops belong to the screen they were tapped on
            for j, (pa, _, ps, _, _) in enumerate(r.get("pops", [])):
                if ps == shown and b(pa) < t:
                    js.append(f'tl.set("#pop{j}", {{ opacity: 0 }}, {t + 0.1});')
            shown = s
        if rr != row:
            js.append(f'tl.to("#phone", {{ y: {cam_y(rr)}, duration: 0.45, ease: "power3.inOut" }}, {t - 0.2});')
            row = rr
    # a slow push keeps the held screens alive
    js.append(f'tl.fromTo("#cam", {{ scale: 1 }}, {{ scale: 1.04, duration: {end}, ease: "sine.inOut" }}, 0);')
    return page(f"r{r['id']}-story", STORY_CSS, "\n".join(body), "\n".join("        " + l for l in js), round(end + 0.04, 3))


def endcard(r):
    ec = r["end_card"]
    dur = r["tail"]
    icon = 220 if ec.get("event") else 300
    parts = [f'<div id="ek" class="kick">{ec["kicker"]}</div>']
    if ec.get("event"):
        parts.append(f'<div id="ev" class="ev">{ec["event"][0]}</div><div id="evs" class="evsub">{ec["event"][1]}</div>')
    parts.append(f'<div class="iconwrap" style="--icon:{icon}px"><div id="halo" class="halo"></div><div id="icon" class="icon"><img src="assets/app-icon.png" alt="" /></div></div>')
    parts.append('<div id="name" class="name">3HO Event App</div>')
    parts.append('<div class="pills"><span id="p0" class="pill">App Store</span><span id="p1" class="pill">Google Play</span></div>')
    parts.append('<div id="free" class="free">Free download</div>')
    body = f'        <div class="col">{"".join(parts)}</div>'
    js = ['tl.fromTo("#ek", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: E }, 0.05);']
    t = 0.1
    if ec.get("event"):
        js.append('tl.fromTo("#ev", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.55, ease: E }, 0.1);')
        js.append('tl.fromTo("#evs", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: E }, 0.3);')
        t = 0.45
    js += [
        f'tl.fromTo("#icon", {{ y: -260, scale: 0.6, rotation: -8, opacity: 0 }}, {{ y: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: "back.out(1.8)" }}, {t});',
        f'tl.fromTo("#halo", {{ opacity: 0.9, scale: 1 }}, {{ opacity: 0, scale: 1.45, duration: 0.8, ease: "power2.out" }}, {t + 0.5});',
        f'tl.fromTo("#name", {{ clipPath: "inset(0 100% 0 0)" }}, {{ clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power2.inOut" }}, {t + 0.55});',
        f'tl.fromTo("#p0, #p1", {{ opacity: 0, y: 30, scale: 0.85 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(2.2)", stagger: 0.18 }}, {t + 1.0});',
        f'tl.fromTo("#free", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.5 }}, {t + 1.5});',
        f'tl.to("#icon", {{ scale: 1.04, duration: {round(dur - t - 1.3, 2)}, ease: "sine.inOut" }}, {t + 1.2});',
    ]
    return page(f"r{r['id']}-end", END_CSS, body, "\n".join("        " + l for l in js), dur)


def index(r, total, music_start):
    sid, eid = f"r{r['id']}-story", f"r{r['id']}-end"
    end = b(r["end"])
    return f"""<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #1e3f86; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #1e3f86; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="1080" data-height="1920">
      <div id="{sid}" class="clip" data-composition-id="{sid}" data-composition-src="compositions/story.html" data-start="0" data-duration="{round(end + 0.04, 3)}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
      <div id="{eid}" class="clip" data-composition-id="{eid}" data-composition-src="compositions/endcard.html" data-start="{end}" data-duration="{r['tail']}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
      <audio id="music" src="assets/audio/music-upbeat.m4a" data-start="0" data-duration="{total}" data-media-start="{music_start}" data-volume="0.7" data-fade-in="0.08" data-fade-out="1.2" data-track-index="2"></audio>
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""


PKG = """{
  "name": "%s",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "npx --yes hyperframes@0.8.181 preview",
    "check": "npx --yes hyperframes@0.8.181 check",
    "render": "npx --yes hyperframes@0.8.181 render",
    "publish": "npx --yes hyperframes@0.8.181 publish"
  }
}
"""

for r in REELS:
    d = ROOT / r["id"]
    (d / "compositions").mkdir(parents=True, exist_ok=True)
    (d / "assets/shots").mkdir(parents=True, exist_ok=True)
    (d / "assets/audio").mkdir(parents=True, exist_ok=True)
    shutil.copytree(ROOT.parent / "tutorial/assets/fonts", d / "assets/fonts", dirs_exist_ok=True)
    shutil.copy(ROOT.parent / "assets/audio/music-upbeat.m4a", d / "assets/audio/music-upbeat.m4a")
    shutil.copy(REPO / "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", d / "assets/app-icon.png")
    used = {s for _, s, _ in r["shots"]} | {p[1] for p in r.get("pops", [])}
    for s in used:
        shutil.copy(ROOT / f"shots/{s}.png", d / f"assets/shots/{s}.png")
    end = b(r["end"])
    total = round(end + r["tail"], 3)
    music_start = round(HIT - end, 3)
    (d / "compositions/story.html").write_text(story(r))
    (d / "compositions/endcard.html").write_text(endcard(r))
    (d / "index.html").write_text(index(r, total, music_start))
    shutil.copy(ROOT.parent / "tutorial/hyperframes.json", d / "hyperframes.json")
    (d / "package.json").write_text(PKG % f"reel-{r['id']}")
    meta = d / "meta.json"
    if not meta.exists():
        meta.write_text(json.dumps({"id": f"reel-{r['id']}", "name": f"Reel {r['id']}: {r['title']}"}, indent=2) + "\n")
    print(f"{r['id']}: {total}s, end card at {end}s, music from {music_start}s")
