"""Generates compositions/frames/*.html and index.html from scenes.json + shared.css.
Edit the markup in scenes.json / motion below, then rerun: python3 scripts/build.py"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
css = (ROOT / "scripts/shared.css").read_text()
scenes = json.loads((ROOT / "scripts/scenes.json").read_text())

COMMON = """
const E = "power3.out";
function caption(n, t) {
  tl.fromTo(`.s${n}-k`, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: E }, t + 0.15);
  tl.fromTo(`.s${n}-h`, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: E }, t + 0.3);
  tl.fromTo(`.s${n}-s`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: E }, t + 0.6);
}
function rise(sel, t, from, to) {
  tl.fromTo(sel, Object.assign({ y: 900 }, from || {}), Object.assign({ y: 0, duration: 1.3, ease: "power4.out" }, to || {}), t);
}
"""

# id, name, start, duration (incl. 0.6 s crossfade overlap), motion (scene-relative seconds)
SPEC = [
 ("1", "hook", 0, 7.6, """
tl.fromTo(".s1-k", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: E }, 0.15);
tl.fromTo(".s1-w", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.8, ease: E, stagger: 0.16 }, 0.3);
tl.fromTo(".s1-s", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: E }, 1.2);
rise(".s1-p", 0.5);
tl.to(".s1-p", { y: -60, duration: 5.6, ease: "sine.inOut" }, 1.8);
"""),
 ("2", "get-the-app", 7, 10.6, """
caption(2, 0);
tl.fromTo(".s2-c", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)", stagger: 0.18 }, 1.2);
tl.fromTo(".s2-n", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.9);
rise(".s2-p", 0.4);
tl.to(".s2-p", { y: -50, duration: 8, ease: "sine.inOut" }, 1.8);
"""),
 ("3", "program", 17, 12.6, """
caption(3, 0);
rise(".s3-back", 0.4, { rotation: -4 }, { rotation: -4 });
tl.to(".s3-back", { y: -40, duration: 10, ease: "sine.inOut" }, 1.8);
tl.fromTo(".s3-front", { x: 760, rotation: 8 }, { x: 0, rotation: 3, duration: 1.1, ease: "power4.out" }, 4.6);
tl.fromTo(".s3-ring", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, 6);
tl.to(".s3-ring", { scale: 1.12, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut" }, 6.5);
tl.to(".s3-ring", { opacity: 0, duration: 0.4 }, 9.2);
"""),
 ("4", "favorites", 29, 11.6, """
caption(4, 0);
rise(".s4-a", 0.4);
[[".s4-h1", ".s4-t1", "567px 352px", 2.4], [".s4-h2", ".s4-t2", "567px 730px", 3.4]].forEach(([img, tap, at, t]) => {
  tl.fromTo(tap, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }, t - 0.25);
  tl.to(tap, { opacity: 0, scale: 1.6, duration: 0.4, ease: "power2.out" }, t);
  tl.fromTo(img, { clipPath: `circle(0px at ${at})` }, { clipPath: `circle(52px at ${at})`, duration: 0.35, ease: "back.out(2.5)" }, t);
});
tl.to(".s4-a", { x: -150, scale: 0.84, rotation: -4, duration: 1, ease: "power3.inOut" }, 6);
tl.fromTo(".s4-b", { x: 760, rotation: 8 }, { x: 0, rotation: 3, duration: 1.1, ease: "power4.out" }, 6.3);
"""),
 ("5", "info", 40, 10.6, """
caption(5, 0);
rise(".s5-p", 0.4);
tl.to(".s5-a", { y: -500, opacity: 0, duration: 1.2, ease: "power3.inOut" }, 4);
tl.fromTo(".s5-b", { y: 500, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.inOut" }, 4);
"""),
 ("6", "map", 50, 12.6, """
caption(6, 0);
rise(".s6-p", 0.4);
tl.fromTo(".s6-b", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.4, ease: "power2.inOut" }, 5);
tl.to(".s6-a", { scale: 1.1, duration: 1.4, ease: "power2.inOut" }, 5);
tl.to(".s6-p", { y: -40, duration: 9, ease: "sine.inOut" }, 1.8);
"""),
 ("7", "offline", 62, 7.6, """
tl.fromTo(".s7-plane", { opacity: 0, x: -200, y: 120, rotation: -10 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.2, ease: E }, 0.2);
caption(7, 0.4);
tl.fromTo(".s7-t", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: E, stagger: 0.15 }, 1.6);
"""),
 ("8", "close", 69, 6, """
caption(8, 0);
tl.fromTo(".s8-l", { opacity: 0, y: 80, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: E }, 0.6);
tl.to(".s8-l", { scale: 1.03, duration: 4.4, ease: "sine.inOut" }, 1.6);
tl.fromTo(".s8-st", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.6);
"""),
]

TOTAL = 75
frames = ROOT / "compositions/frames"
frames.mkdir(parents=True, exist_ok=True)
hosts = []
for n, name, start, dur, motion in SPEC:
    cid = f"f{n}-{name}"
    sc = scenes[n]
    body = sc["body"]
    # heart overlays: background divs instead of duplicate <img> media nodes
    body = re.sub(r'<img class="(s4-h\d)" src="([^"]+)" alt="" style="([^"]+)" />',
                  r'<div class="\1 shot" style="background-image:url(\2);\3"></div>', body)
    fade = "0.01" if n == "1" else "0.6"
    rel = ""
    body = body.replace('src="assets/', f'src="{rel}assets/').replace('url(assets/', f'url({rel}assets/')
    scss = css.replace('url("assets/', f'url("{rel}assets/')
    html = f"""<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>
{scss}
        #root {{ position: absolute; inset: 0; overflow: hidden; font-family: "Geist", ui-sans-serif, system-ui, sans-serif; color: #374151; }}
        .shot {{ position: absolute; inset: 0; background-size: 100% 100%; }}
      </style>
      <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920" data-duration="{dur}">
        <div class="{sc['theme']}" style="position:absolute;inset:0"><div class="inner">{body}</div></div>
      </div>
      <script>
        const tl = gsap.timeline({{ paused: true }});
{COMMON}
        tl.fromTo("#root .inner", {{ opacity: 0 }}, {{ opacity: 1, duration: {fade}, ease: "none" }}, 0);
{motion}
        window.__timelines["{cid}"] = tl;
      </script>
    </template>
  </body>
</html>
"""
    (frames / f"0{n}-{name}.html").write_text(html)
    hosts.append(f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/frames/0{n}-{name}.html" data-start="{start}" data-duration="{dur}" data-track-index="1" data-width="1080" data-height="1920"></div>')

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
audio = (ROOT / "scripts/audio.html")
index = index.replace("<!--AUDIO-->", audio.read_text() if audio.exists() else "")
(ROOT / "index.html").write_text(index)
print("built", len(SPEC), "frames")
