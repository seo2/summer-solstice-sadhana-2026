"""Generates compositions/frames/*.html and index.html for the tutorial.
Scenes live in SCENES below; tap targets come from assets/shots/rects.json (CSS px of the
390 x 844 capture viewport). Rerun after any edit: python3 scripts/build.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
css = (ROOT / "scripts/shared.css").read_text()
RECTS = json.loads((ROOT / "assets/shots/rects.json").read_text())

K = 540 / 390  # capture CSS px -> screen px inside the phone
STEPS = 14


def rect(shot, key, i=0):
    x, y, w, h = RECTS[shot][key][i]
    return x * K, y * K, w * K, h * K


def center(shot, key, i=0):
    x, y, w, h = rect(shot, key, i)
    return x + w / 2, y + h / 2


# Each scene: id, name, planned seconds, theme, kicker, head, sub, extra html,
# layers [(shot, appear_at)], taps [(cx, cy, t)], rings [(x, y, w, h, t_in, t_out)], key moment.
VO = 0.7    # voice-over starts this far into each scene
HOLD = 1.0  # extra breathing room after each line, for first-time viewers
# times below are scene-relative; "VO + word time" lines a tap up with the word that names it
SCENES = [
    dict(n=1, name="welcome", dur=8.0, theme="deep", kick="DEC 15–21, 2026 · LAKE WALES, FL",
         head="Winter Solstice Sadhana 2026", sub="How to use the event app, step by step",
         layers=[("02-event", 0)], key=4.0),
    dict(n=2, name="get-the-app", dur=6.4, step="GET THE APP", head="Get the app",
         sub="Free on the App Store and Google Play",
         extra='<div class="chips tut-chips"><span class="chip c">App Store</span><span class="chip c">Google Play</span></div>',
         layers=[("../11-appstore", 0)], key=6.0),
    dict(n=3, name="open-your-event", dur=8.6, step="OPEN YOUR EVENT", head="Open your event",
         sub="It downloads once, then works offline",
         layers=[("00-splash", 0), ("01b-apphome", 1.6), ("02-event", 4.1)],
         taps=[(*center("01b-apphome", "cont"), VO + 2.9)], key=3.3),
    dict(n=4, name="find-your-way", dur=8.0, step="FIND YOUR WAY", head="Find your way",
         sub="Six tabs at the bottom take you everywhere",
         layers=[("02-event", 0)],
         rings=[(*rect("02-event", "nav", i), VO + w, VO + nxt) for i, (w, nxt) in enumerate([(2.3, 2.7), (2.7, 3.3), (3.3, 4.4), (4.4, 4.6), (4.6, 5.2), (5.2, 6.4)])], key=VO + 2.9),
    dict(n=5, name="browse-the-program", dur=7.0, step="PROGRAM", head="Browse the program",
         sub="Every session, day by day. Tap a day to jump to it.",
         layers=[("03-program-top", 0), ("03b-program-thu", VO + 2.8), ("03c-program-compact", 5.2)],
         taps=[(*center("03-program-top", "wed"), VO + 2.5)], key=VO + 2.4),
    dict(n=6, name="search-and-filter", dur=8.7, step="SEARCH & FILTER", head="Search and filter",
         sub="By name, teacher, venue, category or time of day",
         layers=[("04-search", 0), ("04b-advanced", VO + 3.8)],
         rings=[(*rect("04-search", "search"), VO + 1.9, VO + 3.7)],
         taps=[(*center("04b-advanced", "morning"), VO + 6.0)], key=VO + 2.6),
    dict(n=7, name="session-details", dur=6.3, step="SESSION DETAILS", head="Session details",
         sub="Tap any session: when, where and what to expect",
         layers=[("03-program-top", 0), ("05-detail", VO + 0.5)], key=4.0),
    dict(n=8, name="save-favorites", dur=8.9, step="FAVORITES", head="Save your favorites",
         sub="Tap the heart. Favorites become your agenda.",
         extra='<div class="note tut-note f-note">You&rsquo;ll get a reminder 15 minutes before each one.</div>',
         note_at=VO + 4.9,  # "and the app reminds you"
         layers=[("06-hearts-before", 0), ("06b-hearts-after", VO + 1.4), ("06c-favorites", VO + 2.4)],
         taps=[(*center("06-hearts-before", "hearts", 0), VO + 0.6), (*center("06-hearts-before", "hearts", 1), VO + 1.2)], key=VO + 5.6),
    dict(n=9, name="meet-the-teachers", dur=6.3, step="TEACHERS", head="Meet the teachers",
         sub="Tap a teacher to read their bio",
         layers=[("07-teachers", 0), ("07b-teacher", VO + 1.5)],
         taps=[(*center("07-teachers", "amrit"), VO + 1.0)], key=VO + 2.6),
    dict(n=10, name="daily-menus", dur=5.4, step="MENUS", head="Daily menus",
         sub="What the kitchen is serving each day",
         layers=[("08-menus", 0)], key=3.2),
    dict(n=11, name="info-hub", dur=6.0, step="INFO", head="The Info hub",
         sub="Everything you need to know, grouped by topic",
         layers=[("09-info", 0), ("09b-info-groups", VO + 2.4)], key=VO + 3.4),
    dict(n=12, name="camp-map", dur=7.9, step="MAP", head="Find any venue",
         sub="Pinch or tap + to zoom. Tap a place to see what it is.",
         layers=[("10-map", 0), ("10b-map-zoom", VO + 3.3), ("10c-map-venue", VO + 4.9)],
         taps=[(*center("10-map", "zin"), VO + 3.0), (*center("10b-map-zoom", "asta"), VO + 4.5)], key=VO + 5.6),
    dict(n=13, name="stay-in-the-loop", dur=7.0, step="ANNOUNCEMENTS", head="Stay in the loop",
         sub="The bell brings news from the event team",
         layers=[("11-announcements", 0), ("11b-notifications", VO + 2.6)],
         taps=[(*center("11-announcements", "bell"), 1.7)],
         rings=[(*rect("11b-notifications", "alerts"), VO + 2.9, 6.6)], key=VO + 3.6),
    dict(n=14, name="contact-the-team", dur=6.7, step="CONTACT", head="Contact the team",
         sub="Questions? Messages go out when you're back online.",
         layers=[("12-contact", 0)], key=3.5),
    dict(n=15, name="works-offline", dur=6.4, theme="deep", step="OFFLINE", head="No signal? No problem.",
         sub="Program, map and info stay on your phone", offline=True, tiles_at=VO + 1.9, key=4.4),
    dict(n=16, name="see-you-there", dur=6.0, theme="deep", kick="SEE YOU THERE",
         head="Winter Solstice Sadhana 2026", sub="Dec 15–21, 2026 · Lake Wales, FL", close=True, key=3.6, hold=0),
]

PLANE = '<svg viewBox="0 0 24 24" fill="none" stroke="#ffd66b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>'
CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'

OVERLAP = 0.6


def scene_html(sc):
    n = sc["n"]
    theme = sc.get("theme", "light")
    kick = sc.get("kick") or f"STEP {n - 1} OF {STEPS} · {sc['step']}"
    parts = [f'<div class="cap"><div class="kick k">{kick}</div><div class="head h">{sc["head"]}</div><div class="sub s">{sc["sub"]}</div></div>']
    parts.append(sc.get("extra", ""))
    motion = []
    if sc.get("offline"):
        parts.append(f'<div class="plane pl">{PLANE}</div>')
        parts.append('<div class="tiles">' + "".join(f'<span class="tile t">{CHECK}{w}</span>' for w in ("Program", "Map", "Info")) + "</div>")
        motion.append('tl.fromTo(".pl", { opacity: 0, x: -200, y: 120, rotation: -10 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.2, ease: E }, 0.2);')
        motion.append(f'tl.fromTo(".t", {{ opacity: 0, y: 40 }}, {{ opacity: 1, y: 0, duration: 0.6, ease: E, stagger: 0.3 }}, {sc.get("tiles_at", 1.8)});')
    elif sc.get("close"):
        parts.append('<div class="logo-card lg"><img src="assets/3ho-logo-horizontal.png" alt="" /></div>')
        parts.append('<div class="stores st">3HO Event App · free on the App Store and Google Play</div>')
        motion.append('tl.fromTo(".lg", { opacity: 0, y: 80, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: E }, 0.6);')
        motion.append('tl.to(".lg", { scale: 1.03, duration: 4, ease: "sine.inOut" }, 1.6);')
        motion.append('tl.fromTo(".st", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.6);')
    else:
        layers = []
        for i, (shot, at) in enumerate(sc["layers"]):
            src = f"assets/{shot[3:]}.png" if shot.startswith("../") else f"assets/shots/{shot}.png"
            layers.append(f'<div class="shot L{i}" style="background-image:url({src})"></div>')
            if i > 0:
                motion.append(f'tl.fromTo(".L{i}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.5, ease: "power1.inOut" }}, {at});')
        marks = []
        for j, (cx, cy, t) in enumerate(sc.get("taps", [])):
            marks.append(f'<div class="tap T{j}" style="left:{cx - 42:.0f}px;top:{cy - 42:.0f}px"></div>')
            motion.append(f'tl.fromTo(".T{j}", {{ opacity: 0, scale: 0.5 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }}, {t - 0.5});')
            motion.append(f'tl.to(".T{j}", {{ opacity: 0, scale: 1.7, duration: 0.45, ease: "power2.out" }}, {t});')
        for j, (x, y, w, h, t0, t1) in enumerate(sc.get("rings", [])):
            pad = 8
            marks.append(f'<div class="ring R{j}" style="left:{x - pad:.0f}px;top:{y - pad:.0f}px;width:{w + 2 * pad:.0f}px;height:{h + 2 * pad:.0f}px;border-radius:{min(h + 2 * pad, 40):.0f}px"></div>')
            motion.append(f'tl.fromTo(".R{j}", {{ opacity: 0, scale: 1.25 }}, {{ opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }}, {t0});')
            motion.append(f'tl.to(".R{j}", {{ opacity: 0, duration: 0.3 }}, {round(max(t1, t0 + 0.5), 2)});')
        parts.append(f'<div data-layout-allow-overflow class="phone tut p"><div class="screen">{"".join(layers)}{"".join(marks)}</div></div>')
        motion.insert(0, 'tl.fromTo(".p", { y: 700 }, { y: 0, duration: 1.2, ease: "power4.out" }, 0.3);\n'
                         f'tl.to(".p", {{ y: -26, duration: {round(sc["dur"] + sc.get("hold", HOLD) - 1.5, 2)}, ease: "sine.inOut" }}, 1.5);')
    extra = sc.get("extra", "")
    intro = ['tl.fromTo(".k", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: E }, 0.15);',
             'tl.fromTo(".h", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: E }, 0.3);',
             'tl.fromTo(".s", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: E }, 0.6);']
    if 'class="chip c"' in extra:
        intro.append('tl.fromTo(".c", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: E, stagger: 0.15 }, 1.4);')
    if "tut-note" in extra:
        intro.append(f'tl.fromTo(".tut-note", {{ opacity: 0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: E }}, {sc.get("note_at", 1.4)});')
    motion.insert(0, "\n".join(intro))
    return theme, "".join(parts), "\n".join(motion)


frames = ROOT / "compositions/frames"
frames.mkdir(parents=True, exist_ok=True)
hosts, t, board = [], 0.0, []
for sc in SCENES:
    n = sc["n"]
    dur = round(sc["dur"] + sc.get("hold", HOLD), 2)
    last = n == SCENES[-1]["n"]
    host_dur = round(dur + (0 if last else OVERLAP), 3)
    cid = f"f{n:02d}-{sc['name']}"
    theme, body, motion = scene_html(sc)
    fade = "0.01" if n == 1 else str(OVERLAP)
    html = f"""<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>
{css}
        #root {{ position: absolute; inset: 0; overflow: hidden; font-family: "Geist", ui-sans-serif, system-ui, sans-serif; color: #374151; }}
      </style>
      <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920" data-duration="{host_dur}">
        <div class="{theme}" style="position:absolute;inset:0"><div class="inner">{body}</div></div>
      </div>
      <script>
        const tl = gsap.timeline({{ paused: true }});
        const E = "power3.out";
        tl.fromTo("#root .inner", {{ opacity: 0 }}, {{ opacity: 1, duration: {fade}, ease: "none" }}, 0);
{motion}
        tl.set({{}}, {{}}, {host_dur});
        window.__timelines["{cid}"] = tl;
      </script>
    </template>
  </body>
</html>
"""
    (frames / f"{n:02d}-{sc['name']}.html").write_text(html)
    hosts.append(f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/frames/{n:02d}-{sc["name"]}.html" data-start="{round(t, 3)}" data-duration="{host_dur}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>')
    board.append((n, sc, round(t, 3), round(t + dur, 3), round(t + sc["key"], 2)))
    t += dur

TOTAL = round(t, 3)
index = f"""<!doctype html>
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
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
{chr(10).join(hosts)}
<!--AUDIO-->
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
import wave
def wav_len(path):
    with wave.open(str(path)) as w:
        return round(w.getnframes() / w.getframerate(), 3)
audio = [f'      <audio id="music-bed" src="assets/audio/music-bed-long.m4a" data-start="0" data-duration="{TOTAL}" data-track-index="2" data-volume="0.2"></audio>']
for n, sc, s0, e0, k in board:
    f = ROOT / f"assets/voice/vo{n}.wav"
    if f.exists():
        audio.append(f'      <audio id="voiceover-{n}" src="assets/voice/vo{n}.wav" data-start="{round(s0 + VO, 3)}" data-duration="{wav_len(f)}" data-track-index="3" data-volume="1"></audio>')
index = index.replace("<!--AUDIO-->", "\n".join(audio))
(ROOT / "index.html").write_text(index)
(ROOT / "scripts/board.json").write_text(json.dumps([dict(n=n, name=sc["name"], head=sc["head"], start=s, end=e, key=k) for n, sc, s, e, k in board], indent=1))
print("built", len(SCENES), "frames,", TOTAL, "s; key moments:", ",".join(str(k) for *_, k in board))
