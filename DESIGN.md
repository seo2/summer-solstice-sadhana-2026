# Design

Visual system captured from the current codebase (Tailwind CSS v4, `src/app/globals.css`, component classes). This documents what exists today so changes stay coherent; it is not a spec of what must stay.

## Theme

Light only. Soft sky-and-sun palette over a near-white blue-tinted background with decorative radial gradients. Mobile-first single column, max width `max-w-3xl`, sticky top header + fixed bottom tab bar.

## Color Palette

| Token | Value | Role |
|---|---|---|
| `--background` | `#f7fbff` | Body background (plus layered radial/linear gradients toward `#fff8ea`) |
| `--foreground` | `#374151` | Default body text |
| `--solstice-blue` | `#2f62b6` | Primary brand blue: headings, active states, links, primary buttons |
| `--solstice-sky` | `#39a9ef` | Secondary sky blue: theme color, gradient partner |
| `--solstice-orange` | `#f39200` | Accent: times, kickers, badges, hero accents |
| `--solstice-gold` | `#ffd66b` | Decorative gradient partner |
| `--solstice-mist` | `#eef9f5` | Unused mist tint |

Supporting neutrals come from Tailwind `slate`/`stone` ramps (text: `slate-900/950`, `stone-500–700`; muted: `slate-400–600`). Favorites use `rose-500`. Info hub group accents use Tailwind 50-tint pastels (sky, rose, emerald, amber, orange, violet, indigo, cyan, purple).

## Typography

- **Family:** Geist Sans (`--font-geist-sans`) loaded via `next/font`; Geist Mono available but unused. Note: `body` in globals.css currently declares `Arial, Helvetica, sans-serif`, so Geist only applies where Tailwind `font-sans` is explicit.
- **Weights in use:** heavy — `font-semibold` (600) to `font-black` (900). Black is the default for headings, buttons, labels and pills.
- **Scale:** page titles `text-3xl–4xl`; hero display up to `3.75rem` with `tracking-[-0.055em]`; card titles `text-lg/[18px]`; body `text-sm`; metadata `text-xs`; uppercase kickers with `tracking-[0.2em–0.24em]` precede most page titles.

## Components

- **Cards:** rounded-2xl, 1px translucent blue border, white-translucent backgrounds with `backdrop-filter: blur(18–20px)`, large soft blue shadows (`0 18–24px 45–70px`), often with decorative radial gradients (`.card`, `.quick-tile`, `.activity-list-card`, `.activity-detail-card`, `.filter-glass-card`, `.empty-saved-card`).
- **Day filter pills:** rounded-full white pills, `font-weight: 900`; active state = blue→sky gradient with white text.
- **Tag chips:** rounded-full 50-tint backgrounds with ring (amber = category, sky = location/language).
- **Buttons:** rounded-xl/2xl, `font-black`; primary = solid `#2f62b6` or white-on-dark in hero; favorite toggle = circular icon button, rose-500 when active.
- **Bottom nav:** fixed, 5 items, icon + 11px label, active = `bg-sky-100/80` + blue text.
- **Header:** sticky, translucent white with `backdrop-blur-xl`, 3HO eyebrow + title.
- **Info hub:** `<details>` accordions inside cards; section cards with gradient header strips; list items rendered as tinted rounded boxes (emerald bullets, indigo numbered, slate definition boxes); quotes as orange `border-l-4` callouts.
- **Map viewer:** card-wrapped scrollable container, zoom −/＋ circular buttons with percentage, legend in a bottom-sheet modal (`z-60`, backdrop blur).
- **Install hint:** dismissible sky-tinted card with platform-specific instructions.

## Spacing & Radius

- Rhythm: `space-y-4/5` between sections, `p-4/5` card padding, `gap-2/3` grids.
- Radius: `rounded-xl` (12px) and `rounded-2xl` (16px) dominate; pills `rounded-full`.

## Motion

- Minimal: 160ms eases on filter pills, `active:scale-95/98` press feedback, `transition-colors` on nav. No keyframe animations, no reduced-motion overrides (little to override).

## Known tensions (for future work)

- Heavy use of translucency + `backdrop-filter` conflicts with sunlight legibility and battery (PRODUCT.md principles 1 and 5).
- Several text/background pairs sit below 4.5:1 (white/60–70 on blue hero, stone-400/500 metadata, orange `#f39200` text on white).
- Font-weight ceiling (everything black/semibold) flattens hierarchy; body font-family fallback bypasses Geist.
- Decorative gradient orbs and glass cards lean "festival hype", against the serene-luminous personality.
