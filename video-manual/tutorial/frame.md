# frame.md — Winter Solstice Sadhana 2026 app tutorial

Design truth for this video. Source: repo `DESIGN.md` (the app's own tokens), adapted for 1080×1920.

## Concept
One hero prop: **the phone**. A real capture of the app rises from the bottom edge of every scene; the headline sits above it in the top 40% (caption keep-out for platform UI at the bottom 17%). Light sky-and-sun world for the tour, deep solstice blue for the open, the offline beat and the close.

## Palette (role → hex)
| Role | Hex | From |
|---|---|---|
| Background | #f7fbff → #fff8ea gradient | `--background` |
| Primary / headline | #2f62b6 | `--solstice-blue` |
| Secondary / glow | #39a9ef | `--solstice-sky` |
| Accent / kicker | #f39200 | `--solstice-orange` |
| Decorative | #ffd66b | `--solstice-gold` |
| Text | #374151 | `--foreground` |
| Favorite | #f43f5e | rose-500 |
| Deep (open/offline/close) | #1e3f86 → #2f62b6 | blue ramp |

## Type
- Display: Geist Black (900), −0.045em, 96–120 px, blue on light / white on deep.
- Kicker: Geist Bold uppercase, 0.2em tracking, 34 px, orange.
- Sub-line: Geist Semibold 44 px, #374151 (white 85% on deep).

## Shape
Phone: 6 px graphite bezel, radius 90 px, soft blue shadow `0 40px 120px rgba(47,98,182,.35)`. Chips: full-round, white, 1 px blue/20% border, Geist Black.

## Bans
No fake UI (only real captures), no stock imagery, no glow orbs, no side-by-side explainer layouts, no static end card (the close breathes). Never mention summer, Ram Das Puri or altitude. Terminology exact: Sadhana, Gurdwara, WTY®.

## Held frame
Frame 7 (offline): nothing moves for ~1.5 s while "No signal? No problem." lands.

## Tutorial additions (2026-10-20)
- Phone is the small size (560 × 1198) and fully visible, centred under the caption, so every
  tap target and the bottom tab bar stay on screen. Caption text sits inside the title-safe box (108 px sides).
- Kicker carries the step counter: "STEP 3 OF 14 · PROGRAM".
- Tap marker: orange ring that lands on the real control, then the next capture crossfades in.
