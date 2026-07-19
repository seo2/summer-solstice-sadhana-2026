# Program — Graphic System

Specification **focused only on the Program** section of the Summer Solstice Sadhana 2026 app,
intended so the **same design can be reapplied to the program on the website**.

Source of truth (every value below matches 1:1):

- `src/app/globals.css` — tokens and classes (`.activity-list-card`, `.filter-glass-card`, `.day-filter-button`, …)
- `src/components/activity-card.tsx` — activity card and routine variant
- `src/components/program-explorer.tsx` — filter panel, day strip, day headers
- `src/app/program/[id]/page.tsx` — detail card

Living, portable example (plain CSS, no Tailwind): **[`program-style-guide.html`](program-style-guide.html)** — open it in the browser.

> This document describes **the Program** only. The visual system for the whole app is in `DESIGN.md` at the repo root.

---

## 1. Principles

1. **Sky-and-sun over near-white.** Brand blue is the structural color; orange is an accent only (times, kickers, badges).
2. **Soft glass.** Translucent white cards with `backdrop-filter` and a large blue shadow; never hard black shadows.
3. **Color encodes meaning in chips.** Category = amber, topic = rose, place/language = sky. Do not mix.
4. **Hierarchy by weight, not size.** Almost everything is `font-weight` 700–900; size varies little.
5. **Minimal motion.** 160 ms on pills and a `scale(.98)` on press. No flashy animation.
6. **Mobile-first, single column**, container `max-width: 48rem` (`max-w-3xl`), side padding `1rem`.

---

## 2. Color tokens

### Brand

| Token | Value | Use |
|---|---|---|
| `--solstice-blue` | `#2f62b6` | Primary blue: headings, active day, links, primary button, day header |
| `--solstice-sky` | `#39a9ef` | Gradient partner, `theme-color`, glows |
| `--solstice-orange` | `#f39200` | Accent: **times**, kickers, category badge (detail) |
| `--solstice-gold` | `#ffd66b` | Decorative glow (card corners) |

### Neutrals (Tailwind slate/stone ramp)

| Name | Hex | Use |
|---|---|---|
| slate-950 | `#020617` | Detail title, empty-state title |
| slate-900 | `#0f172a` | Activity card title |
| slate-700 | `#334155` | Facilitator ("With …") |
| slate-600 | `#475569` | List description |
| slate-400 | `#94a3b8` | Search placeholder |
| stone-700 | `#44403c` | Detail body / facilitator (detail) |
| stone-600 | `#57534e` | Secondary text |
| stone-500 | `#78716c` | Routine title |
| stone-400 | `#a8a29e` | Routine time & metadata; "Facilitator" label |
| stone-300 | `#d6d3d1` | Routine dot |
| rose-500 | `#f43f5e` | **Active favorite** |

### Chips (50-tint fill + 200/80 ring)

| Type | Fill | Text | Ring |
|---|---|---|---|
| Category | amber-50 `#fffbeb` | amber-800 `#92400e` | `rgba(253,230,138,.8)` |
| Topic / tag | rose-50 `#fff1f2` | rose-800 `#9f1239` | `rgba(254,205,211,.8)` |
| Place | sky-50 `#f0f9ff` | **`#2f62b6`** | `rgba(186,230,253,.8)` |
| Language | sky-50 `#f0f9ff` | sky-800 `#075985` | `rgba(186,230,253,.8)` |
| Badge (detail) | `rgba(255,246,225,.92)` | `#9a5a00` | border `rgba(243,146,0,.26)` |

### Lines and shadows (cross-cutting)

| Token | Value |
|---|---|
| Card border | `1px solid rgba(47, 98, 182, .10–.12)` |
| Divider / soft ring (`sky-900/10`) | `rgba(12, 74, 110, .10)` |
| Card shadow | `0 18px 48px rgba(47, 98, 182, .08)` |
| Strong shadow (detail, empty) | `0 24px 70px rgba(47, 98, 182, .10)` |
| Pill / input shadow | `0 8px 22px rgba(15, 23, 42, .04)` |
| Active pill shadow | `0 12px 26px rgba(47, 98, 182, .24)` |
| Favorite button shadow | `0 10px 24px rgba(15, 23, 42, .08)` |

### Page background (reference)

```css
background:
  radial-gradient(circle at 18% -8%, rgba(57,169,239,.30), transparent 22rem),
  radial-gradient(circle at 88% 12%, rgba(255,214,107,.32), transparent 18rem),
  linear-gradient(180deg, #f8fcff 0%, #ffffff 42%, #fff8ea 100%);
```

---

## 3. Typography

- **Family:** Geist Sans with a system fallback
  (`"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).
- **Weights:** 600 (semibold), 700 (bold), 900 (black). Black (900) is the default weight for titles, buttons, pills and labels.

| Element | Size | Weight | Tracking / line | Color |
|---|---|---|---|---|
| Kicker (detail date) | 12px | 900 | `+.24em`, UPPER | blue |
| Detail title | 36–40px | 900 | `-.045em`, line `.98` | slate-950 |
| Card title | 18px | 900 | line ~1.35, `line-clamp: 2` | slate-900 |
| Time (list) | 14px | 700 | tight line | **orange** |
| Time (detail) | 20px | 900 | — | **orange** |
| Day header | 14px | 900 | — | blue |
| Facilitator ("With …") | 14px | 600 | — | slate-700 |
| Description | 14px | 400 | line `1.6`, `line-clamp: 3` | slate-600 |
| Meta label ("Facilitator") | 12px | 900 | UPPER, wide tracking | stone-400 |

---

## 4. Layout and rhythm

- Container: `max-width: 48rem`, side padding `1rem`.
- **Filter panel:** `sticky` at the top (`top: 4.35rem` in the app); wrapped in glass.
- **Day header:** `sticky` just below the panel; groups activities by date.
- Gap between cards of the same day: `0.75rem` (`space-y-3`). Between day groups: `0.5rem`.
- Inner padding: list card `1rem` (`p-4`); detail card `1.5rem`+ (`p-5`/`p-8`).
- **Radii:** `rounded-2xl` = **16px** (cards), `rounded-xl` = **12px** (inputs, photos), `rounded-full` (pills, chips, favorite button).

---

## 5. Components

### 5.1 Filter panel (`.filter-glass-card`)
Glass with a sky glow at the top-right. Contains:
- **Search:** white `rounded-xl` row, blue magnifier icon, 16px/600 input, slate-400 placeholder.
- **Day strip:** pill buttons in a horizontal scroller with no visible scrollbar.
- **Two selects** ("Venue", "Category") in a 2-column grid (1 column on narrow mobile).

### 5.2 Day pill (`.day-filter-button`)
- Base: white pill `rgba(255,255,255,.94)`, 12% blue border, blue **900** text, 14px, pill shadow.
- **Active** (`.day-filter-button-active`): `linear-gradient(135deg, #2f62b6, #39a9ef)`, white text, reinforced blue shadow.
- 160 ms transition; `:active { transform: scale(.98) }`.

### 5.3 Day header
Row with a bold blue label + a thin rule (`height:1px; flex:1; background: sky-900/10`) that fills the rest of the line. Date format: `weekday, month day` (e.g. *Saturday, June 20*).

### 5.4 Activity card (`.activity-list-card`)
Core of the program.
- Background: peach radial glow `rgba(255,237,213,.78)` top-right + white gradient 0.94→0.82; `blur(18px)`; 10% blue border; card shadow.
- **Row 1:** time (orange, 14px/700) + title (18px/900, `line-clamp: 2`) on the left; circular favorite button on the right.
- **Row 2 (chips):** category, tags, place, language (see taxonomy in §2).
- **Row 3:** photo(s) `w-12/w-16` `object-contain` with a soft border + facilitator ("With X · Country") + description (`line-clamp: 3`).

### 5.5 Compact routine card
For `category` ∈ {`Meal`, `Logistics`} or titles starting with "Rise up".
Muted tone so it doesn't compete: `bg-stone-50`, `stone-200` ring, `rounded-xl`. stone-300 dot + time (12px/600 stone-400) + title (14px/700 stone-500) + place with icon on the right.

### 5.6 Tag chips
`rounded-full` pill, `padding: .375rem .75rem`, 12px/700, 50-tint fill + 200/80 ring. Color **encodes the data type** (§2). The place chip has a pin icon on the left.

### 5.7 Favorite button (`.activity-action-button`)
Circular 40×40, `rounded-full`, shadow `0 10px 24px rgba(15,23,42,.08)`.
- **Idle:** white fill, outlined slate-600 heart, `sky-900/10` ring.
- **Active:** `rose-500` fill, solid white heart, `rose-400/40` ring.

### 5.8 Detail card (`.activity-detail-card`)
Gold (top-right) + sky (bottom-left) glows + white gradient; `blur(20px)`; strong shadow; padding `1.5rem`+.
Order: "← Program" link (blue/900) → date kicker → large title → 20px orange time → chips (category uses the orange `badge`) → photo + facilitator block (meta label + name) + `whitespace-pre-wrap` description.

### 5.9 Empty state (`.empty-saved-card`)
Same glass with gold + sky glows; heart inside a white ring; slate-950 black title; support copy; blue primary CTA (`.btn-primary`).

---

## 6. Base effects (the "family")

- **Glass:** translucent white `0.82–0.96` + `backdrop-filter: blur(18–20px)` + 1px blue border at 10–12%.
- **Shadow:** always blue-tinted and large; never black/hard.
- **Radial glows:** peach/gold top-right, sky bottom-left; low opacity; decorative, inside the card.
- **Motion:** 160 ms on pills; `:active { transform: scale(.98) }`; no keyframes.

---

## 7. How to apply it to the website

1. Copy the `:root` block from [`program-style-guide.html`](program-style-guide.html) as a token layer (or map it onto the variables the site already uses).
2. Reuse the component classes as-is (`.activity-list-card`, `.filter-glass-card`, `.day-filter-button(-active)`, `.chip-tag` + modifier, `.activity-detail-card`, `.badge`, `.fav-btn`).
3. Load **Geist** (or a similar geometric sans) and keep the 600/700/900 weight scale.
4. Keep the **chip color taxonomy** — it's the one place where color carries meaning.
5. If the site already has its own grid, keep `max-width: 48rem` for the program column and the `0.75rem` rhythm between cards.

### Inherited caveats (from `DESIGN.md`, keep in mind when porting)
- Translucency + `backdrop-filter` can hurt legibility in bright sun and cost battery.
- Some text/background pairs fall below 4.5:1 (orange `#f39200` on white, stone-400 metadata). If the site requires AA, darken those texts.
- The weight ceiling (almost everything 900) flattens hierarchy; consider dropping body text to 600–700 when reapplying.
