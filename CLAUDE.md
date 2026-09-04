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
- `.app-map-scroll` in `src/app/globals.css` sets `touch-action: none` and disables selection/image
  drag. The viewer handles **every touch gesture in JS** (one-finger pan, two-finger pinch anchored
  under the fingers, fling on release). Do not reintroduce native touch panning (`pan-x pan-y`):
  iOS ignores programmatic scroll writes while a native scroll gesture is in flight, which made the
  pinch scale from the map's top-left corner. Mouse wheel and scrollbars still work natively.

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

## Git workflow (branch per change set)

Every change set gets its own branch, then push and merge on completion. Do not commit
work-in-progress directly to `main`.

Standard flow for a change set:

```bash
# 1. Branch from an up-to-date main
git switch main && git pull --ff-only
git switch -c <type>/<short-topic>        # e.g. feat/user-profile, docs/roadmap, fix/map-zoom

# 2. Do the work, then stage ONLY the files for this change set
git add <specific files>                   # never `git add -A` blindly — preserve unrelated dirty files
git commit -m "<concise message>"

# 3. Push and merge when the change set is complete and validated
git push -u origin <branch>
git switch main
git merge --ff-only <branch>               # or open a PR if review is wanted
git push origin main
git branch -d <branch>
git push origin --delete <branch>
```

Rules:

- Branch names use a `type/topic` prefix: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`.
- One coherent change set per branch. Keep patches focused.
- Inspect `git status --short` before broad edits. **Do not overwrite unrelated user changes** —
  stage files explicitly, never sweep pre-existing dirty files into a commit.
- Merge to `main` only after validation passes (typecheck, lint, build — see checklist below).
- Push and merge at the end of a completed change set. If the user wants review first, push the
  branch and open a PR instead of merging.
- End commit messages with the required co-author trailer.

## Changelog discipline

Keep `CHANGELOG.md` at the repo root current. It follows the "Keep a Changelog" format.

- Every user-visible or structural change adds a bullet under `## [Unreleased]` in the correct
  group (`Added`, `Changed`, `Fixed`, `Removed`).
- Note the offline cache version bump in the entry when one happened (e.g. "cache → v44").
- When a set of changes ships, move the `Unreleased` bullets into a dated version section.

## Documentation discipline

Document decisions and plans in Markdown, not only in code.

- `README.md` is the front door: what the app is, stack, quick start, and a link to the docs index.
- `docs/INDEX.md` is the master index of every Markdown doc — **keep it updated** whenever a doc is
  added, renamed, or removed.
- Planning/architecture docs live under `docs/` (e.g. `ROADMAP.md`, `BACKEND.md`, `NATIVE.md`,
  `LOCAL-NETWORK.md`, `FEATURES.md`). Non-trivial features get a doc before or alongside the code.
- Prose docs are in English (consistent with the repo); `TODO_CONTENT_REVIEW.md` and event content
  may be Spanish. UI copy remains English unless asked otherwise.

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
9. `CHANGELOG.md` updated and relevant docs (`docs/INDEX.md`, feature docs) reflect the change.
10. Work is on a `type/topic` branch; pushed and merged (or a PR opened) per the git workflow above.
