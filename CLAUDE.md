# CLAUDE.md

Guidance for Claude Code and other coding agents working in this repository.

## Project

Summer Solstice Sadhana 2026 is an offline-first mobile/PWA guide for the 3HO Summer Solstice event. It contains:

- Program schedule browsing and detail pages.
- Favorites and personal agenda saved locally with Dexie/IndexedDB.
- Offline info hub generated from structured booklet/PDF content.
- Camp map with app-style scroll and internal zoom controls.
- Static export plus PWA service worker for offline installation.

Primary source path: `/Users/Seo2_1/htdocs/summer-solstice-sadhana-2026`.

## Important Next.js rule

This project uses Next.js 15.5.x. Do not assume older Next.js APIs or behavior.

Before changing Next-specific APIs, routing, metadata, PWA, image handling, or static export behavior, read the relevant docs under:

```bash
node_modules/next/dist/docs/
```

Heed deprecation warnings. There is also an `AGENTS.md` in this repo with this same warning.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- `@ducanh2912/next-pwa` / Workbox
- Dexie for local favorites and agenda
- Capacitor dependencies are present for mobile/native sync workflows
- Static export is enabled via `output: "export"`
- Next Image is configured as unoptimized for export

Key config:

- `next.config.ts`
- `src/app/layout.tsx`
- `src/app/manifest.ts`
- `src/components/offline-preloader.tsx`

## Commands

Use npm. Important scripts:

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run cap:sync
```

For local dev on an alternate port, use:

```bash
npm run dev -- -p 3011
```

For normal verification before reporting a code/content change complete, run:

```bash
npm run typecheck && npm run lint && npm run build
```

The build exports static files into `out/`.

## Static export and generated output checks

After content/UI changes, verify the exported output, not only the source.

Examples:

```bash
python3 - <<'PY'
from pathlib import Path
html = Path('out/map.html').read_text(errors='ignore') + Path('out/map.txt').read_text(errors='ignore')
print('Map Legend' in html)
PY
```

Routes may export as flat files such as:

- `out/index.html`
- `out/map.html`
- `out/map.txt`
- `out/info.html`
- `out/info.txt`

Do not assume `out/map/index.html` exists.

## Offline/PWA cache rule

This is offline-first. When changing visible UI, content, static assets, map behavior, or generated route content, bump the offline cache version in both places:

1. `src/components/offline-preloader.tsx`
   - `CACHE_NAME`
   - `STORAGE_KEY`
   - `DISMISSED_KEY`
2. `next.config.ts`
   - `OFFLINE_CACHE`

Keep the versions synchronized, e.g. `solstice-full-offline-v25`.

Also check that required static assets are listed in `staticAssets` inside `src/components/offline-preloader.tsx` when adding new public assets.

## Data files and rendering pipeline

Structured content lives mostly in JSON:

- `src/data/program.json` — schedule/activity data
- `src/data/categories.json` — category filters
- `src/data/venues.json` — venue cards on map page
- `src/data/info-pages.json` — offline Info Hub content

Important renderers:

- Program list: `src/components/program-explorer.tsx`
- Activity cards: `src/components/activity-card.tsx`
- Program detail: `src/app/program/[id]/page.tsx`
- Info hub: `src/app/info/page.tsx`
- Map page: `src/app/map/page.tsx`

For Info Hub changes, understand the flow before editing:

`info-pages.json` → `pageTitles` / `infoGroups` / `sectionHeadings` in `src/app/info/page.tsx` → `normalizeLines()` → `sectionsFor()` → `SectionCard()`.

Pitfalls:

- `normalizeLines()` filters page titles. If a page title is also the first intended section heading, the heading can disappear unless specifically preserved.
- `sectionHeadings` controls which lines become section cards.
- Bullet lines beginning with `∙`, `•`, `—`, or `-` render as styled list items.
- Avoid user-facing labels like “PDF page” or “Section N”.
- Keep visible labels clean and event-attendee friendly.

Current notable Info behavior:

- `page-50` is displayed as “Sadhana & Gurdwara”. Its internal headings “Sadhana” and “Gurdwara” should both render as section-card titles.
- `page-16` “Security at Solstice” is also preserved so its first internal title renders.

## Map page behavior

`src/app/map/page.tsx` is a client component because it has internal zoom controls.

Current intended behavior:

- Browser/page zoom is disabled globally in `src/app/layout.tsx` via viewport settings:
  - `initialScale: 1`
  - `maximumScale: 1`
  - `userScalable: false`
- The map itself has app-style internal zoom controls in `src/app/map/map-viewer.tsx`:
  - Zoom out button
  - Zoom in button
  - percentage indicator
  - internal pinch-to-zoom on the map container
  - current range: 50% to 300%
  - current step: 25%
- The map image sits inside a scrollable container for panning.
- `.app-map-scroll` in `src/app/globals.css` allows map gestures and avoids selection/image drag.

If changing map zoom/pan behavior, verify in a browser that:

- `+` changes 100% to 125%.
- Image dimensions change accordingly.
- The map remains scrollable.
- Browser/page zoom remains blocked while the map's own pinch/controls still work.

## Assets

User-facing images should be served from `public/`, not directly from `references/`.

Known map asset:

- `public/images/camp-map.png`

If replacing or adding images:

1. Put the user-facing file under `public/images/`.
2. Update references in source.
3. Update `staticAssets` in `src/components/offline-preloader.tsx` if it needs offline preload.
4. Bump offline cache versions.
5. Run build and verify the file exists under `out/images/`.

## UI/content conventions

- User-facing copy should be clean and attendee-facing.
- Avoid internal/source labels in the UI.
- Preserve 3HO/Summer Solstice terminology and symbols exactly where provided: WTY®, White Tantric Yoga®, Sadhana, Gurdwara, Ram Das Puri.
- The user often asks in Spanish but most app UI is English unless explicitly asked otherwise.
- For small content edits, search exact text and nearby variants before editing.
- After changes, search generated `out/` for distinctive phrases to confirm the rendered result.

## Git and process expectations

- Inspect `git status --short` before broad edits if you need to understand current dirty files.
- Do not overwrite unrelated user changes.
- Use focused patches.
- Do not claim success without running real validation or reporting why it could not run.
- If starting a dev server for visual/browser verification, use a tracked background process and stop it afterwards.

## Recommended completion checklist

Before reporting a task complete:

1. Source changes are narrow and intentional.
2. Offline cache version was bumped when needed.
3. `npm run typecheck` passes.
4. `npm run lint` passes.
5. `npm run build` passes.
6. Exported `out/` output contains the intended text/classes/assets.
7. Browser verification was done for interactive map/app behavior when relevant.
8. Any dev server started for verification has been stopped.
