#!/usr/bin/env node
/**
 * Pull the published Teacher & Musician program from the checkout platform
 * (register.3ho.org, plugin 3ho-tickets) and merge it into the app's bundled
 * data files. Phase 1 of the checkout↔app integration: build-time import, so
 * static detail routes and the offline preloader keep working unchanged.
 *
 *   npm run pull-program -- [--base https://register.3ho.org] [--event wsol26]
 *                           [--insecure] [--dry-run]
 *
 * Source: GET {base}/wp-json/wsol/v1/presenter/bundle?event={slug}
 * (the SyncedBundle shape — see src/lib/event-store.ts).
 *
 * Merge rules — the presenter feed is one source among several (the base
 * program still comes from the booklet / 3ho.org), so this script only owns
 * the rows it created:
 *   - program.json: entries with id "presenter-*" are replaced wholesale by
 *     the feed; everything else is left untouched.
 *   - teachers.json: matched by id or facilitatorNames (case-insensitive).
 *     Existing entries are enriched (empty bio / missing photo / country);
 *     unknown presenters are appended.
 *   - venues.json / categories.json: missing entries appended by slug id.
 *   - Photos are downloaded to public/images/teachers/ (existing naming:
 *     Name-With-Dashes.ext) and rewritten to local paths, so they ship in
 *     the static export and precache offline. Existing files are kept.
 *
 * After importing real content, bump the offline cache version in
 * src/components/offline-preloader.tsx and next.config.ts (see CLAUDE.md).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "src", "data");
const photosDir = join(root, "public", "images", "teachers");

/* ---------------------------------------------------------------- CLI */
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE = (process.env.CHECKOUT_BASE || opt("--base", "https://register.3ho.org")).replace(/\/$/, "");
const EVENT = opt("--event", "wsol26");
const DRY = flag("--dry-run");
if (flag("--insecure")) process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const PRESENTER_PREFIX = "presenter-";

/* ------------------------------------------------------------- helpers */
const readJson = (file) => JSON.parse(readFileSync(join(dataDir, file), "utf8"));
const writeJson = (file, value) => {
  if (DRY) return;
  writeFileSync(join(dataDir, file), JSON.stringify(value, null, 2) + "\n");
};
const norm = (s) => (s || "").trim().toLowerCase();
/** "Sat Nam Kaur" → "Sat-Nam-Kaur" (existing photo naming convention). */
const photoBase = (name) => name.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");

async function fetchBundle() {
  const url = `${BASE}/wp-json/wsol/v1/presenter/bundle?event=${encodeURIComponent(EVENT)}`;
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Bundle fetch failed: HTTP ${res.status}`);
  const bundle = await res.json();
  if (!Array.isArray(bundle.program) || !Array.isArray(bundle.teachers)) {
    throw new Error("Unexpected bundle shape (missing program/teachers arrays).");
  }
  return bundle;
}

/** Download a remote photo into public/images/teachers/; returns the local
 *  web path, or null when the download fails (photo left remote-less). */
async function downloadPhoto(url, teacherName) {
  if (!url) return null;
  const ext = (new URL(url).pathname.match(/\.(jpe?g|png|webp)$/i) || [, "jpg"])[1].toLowerCase();
  const file = `${photoBase(teacherName)}.${ext}`;
  const dest = join(photosDir, file);
  const webPath = `/images/teachers/${file}`;
  if (existsSync(dest)) return webPath; // keep curated photos
  if (DRY) return webPath;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    mkdirSync(photosDir, { recursive: true });
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    return webPath;
  } catch (err) {
    console.warn(`  ! photo download failed for ${teacherName}: ${err.message}`);
    return null;
  }
}

/* ----------------------------------------------------------------- run */
const bundle = await fetchBundle();
console.log(
  `Bundle v${bundle.version} · event ${bundle.event?.slug} · ` +
  `${bundle.program.length} scheduled session(s), ${bundle.teachers.length} teacher(s)`
);

const program = readJson("program.json");
const teachers = readJson("teachers.json");
const venues = readJson("venues.json");
const categories = readJson("categories.json");

/* Photos first, so both program and teacher entries get the local path. */
const photoByTeacher = new Map();
for (const t of bundle.teachers) {
  photoByTeacher.set(norm(t.name), await downloadPhoto(t.photo, t.name));
}

/* program.json — replace the presenter-owned slice. */
const kept = program.filter((a) => !String(a.id).startsWith(PRESENTER_PREFIX));
const removed = program.length - kept.length;
const imported = bundle.program
  .map((a) => {
    const entry = { ...a };
    delete entry.photo;
    const local = photoByTeacher.get(norm(a.facilitator));
    if (local) entry.photo = local;
    return entry;
  })
  .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
writeJson("program.json", [...kept, ...imported]);
console.log(`program.json: ${removed} presenter entr${removed === 1 ? "y" : "ies"} replaced by ${imported.length}`);

/* teachers.json — enrich matches, append the rest. */
let enriched = 0;
let added = 0;
for (const t of bundle.teachers) {
  const localPhoto = photoByTeacher.get(norm(t.name));
  const existing = teachers.find(
    (e) => e.id === t.id || (e.facilitatorNames || []).some((n) => norm(n) === norm(t.name))
  );
  if (existing) {
    if (!existing.bio && t.bio) existing.bio = t.bio;
    if (!existing.photo && localPhoto) existing.photo = localPhoto;
    if (!existing.country && t.country) existing.country = t.country;
    if (!(existing.facilitatorNames || []).some((n) => norm(n) === norm(t.name))) {
      existing.facilitatorNames = [...(existing.facilitatorNames || []), t.name];
    }
    enriched++;
  } else {
    const entry = { id: t.id, name: t.name, facilitatorNames: t.facilitatorNames || [t.name], bio: t.bio || "" };
    if (t.country) entry.country = t.country;
    if (localPhoto) entry.photo = localPhoto;
    teachers.push(entry);
    added++;
  }
}
writeJson("teachers.json", teachers);
console.log(`teachers.json: ${enriched} enriched, ${added} added (total ${teachers.length})`);

/* venues.json / categories.json — append what's missing. */
const appendMissing = (file, list, incoming) => {
  const have = new Set(list.map((v) => v.id));
  const fresh = (incoming || []).filter((v) => v.id && !have.has(v.id));
  if (fresh.length) writeJson(file, [...list, ...fresh.map((v) => ({ id: v.id, name: v.name }))]);
  console.log(`${file}: +${fresh.length}`);
};
appendMissing("venues.json", venues, bundle.venues);
appendMissing("categories.json", categories, bundle.categories);

console.log(DRY ? "\nDry run — nothing written." : "\nDone. Review the diff, then remember the offline cache bump (CLAUDE.md) before shipping.");
