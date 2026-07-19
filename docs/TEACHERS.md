# Teacher / presenter info

Spec for teacher (presenter) profiles, accessible from the program.

> Status: **step 1 (static-first) shipped** — `/teachers` directory, `/teachers/[id]`
> profiles, and the quick-view modal from program cards/detail are live (cache v44).
> Linkage is by facilitator name (`facilitatorNames` in `teachers.json`) instead of
> `teacherIds` on program items, keeping `program.json` untouched; the backend bundle
> will ship explicit ids. Bios are empty — "About" renders once filled in
> `src/data/teachers.json`. Visual reference: `design/teachers-prototype.html`.

## Goal

Attendees browsing the program can tap a session's teacher and see who they are: photo,
bio, country/lineage, and every session they lead — and, inversely, discover sessions by
teacher.

## Data model

Per [BACKEND.md](BACKEND.md), scoped by event:

```
teacher              (id, event_id, name, bio, photo_url, country?, links?)
program_item_teacher (program_item_id, teacher_id)   -- many-to-many: co-taught sessions
```

Many-to-many (not a single `teacher_id` on `program_item`) because sessions can be
co-taught. Teacher content ships inside the same **versioned sync bundle** as the rest of
the event content, so it works fully offline.

## Rollout in two steps

1. **Static-first (no backend needed):** add `src/data/teachers.json` + a
   `teacherIds` field on program items in `program.json`. Render teacher pages/sheets and
   link them from `activity-card.tsx` / the program detail page. Ships value immediately
   and defines the exact shape the backend bundle must later serve.
2. **Backend-driven (Phase 1+):** the same JSON shape is produced by the WordPress
   bundle endpoint; staff edit teachers in wp-admin. The client does not change.

## UI touchpoints

- **Program detail** (`src/app/program/[id]/page.tsx`): teacher name(s) become links.
- **Teacher page/sheet**: photo, bio, country, list of their sessions (each linking back
  to program detail; sessions addable to the agenda from there).
- **Teachers directory** (optional, later): searchable list, e.g. under Info or its own tab.
- Follow the existing `design/` teachers prototype for visual direction.

## Offline & cache rules

Teachers are static export content: new route(s) + images mean updating `staticAssets`
in `src/components/offline-preloader.tsx` and bumping the offline cache version in both
places (see `CLAUDE.md`). Teacher photos live under `public/images/teachers/`, optimized
for offline preload (small, compressed).

## Content pipeline

- Source: event production team provides names/bios/photos (booklet + registration data).
- Until wp-admin exists, content is edited directly in `teachers.json`
  (review via `TODO_CONTENT_REVIEW.md` if content arrives in Spanish).
