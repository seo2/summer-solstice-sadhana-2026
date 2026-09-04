#!/usr/bin/env node
/**
 * fixture-to-csv.mjs — turn a sync-bundle fixture into the CSV files the
 * WordPress plugin's Import screen accepts (Event App → Import).
 *
 *   npm run fixtures:csv            → all fixtures in scripts/fixtures/
 *   npm run fixtures:csv -- wsol26  → just that one
 *
 * Writes scripts/fixtures/csv/<slug>-{program,teachers,menus}.csv.
 *
 * The column lists below mirror THREEHO_SSA_Importer::csv_columns() in the
 * plugin, and the "|" separator mirrors its CSV_MULTI_SEPARATOR — keep them in
 * sync. Field names are the same ones the JSON importer uses, so a row here is
 * the same contract as an object in the bundle. See docs/CONTENT-MODEL.md.
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FIXTURES_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const OUT_DIR = join(FIXTURES_DIR, "csv");

const COLUMNS = {
  program: ["id", "date", "day", "startTime", "endTime", "title", "category", "tags", "location", "facilitator", "country", "language", "description", "photo", "photos", "sourcePage"],
  teachers: ["id", "name", "facilitatorNames", "bio", "country", "photo", "photos"],
  menus: ["id", "date", "meal", "title", "items", "notes", "sort"],
  // Not importable from the plugin's Import screen yet — their upserts still
  // live in WP-CLI (upsert_simple / upsert_info_pages). Emitted so the files are
  // ready the moment the screen learns these types; the columns match what
  // those upserts read.
  venues: ["id", "name", "description", "mapX", "mapY", "color", "number", "featured", "kind"],
  categories: ["id", "name"],
  infoPages: ["id", "title", "content", "sourcePage"],
};

const MULTI_SEPARATOR = "|";

/** RFC 4180 quoting: quote when the value holds a comma, quote or line break. */
function csvCell(value) {
  if (value === undefined || value === null) return "";

  const text = Array.isArray(value) ? value.join(MULTI_SEPARATOR) : String(value);

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(columns, rows) {
  const lines = [columns.join(",")];

  for (const row of rows) {
    lines.push(columns.map((column) => csvCell(row[column])).join(","));
  }

  // Trailing newline: some spreadsheet importers drop the last row without it.
  return `${lines.join("\n")}\n`;
}

/** Nested bundle fields flattened into CSV cells (venues: `mapPoint` → `mapX` / `mapY`). */
function flattenRow(row) {
  if (row.mapPoint && typeof row.mapPoint === "object") {
    return { ...row, mapX: row.mapPoint.x, mapY: row.mapPoint.y };
  }
  return row;
}

function convert(slug) {
  const bundle = JSON.parse(readFileSync(join(FIXTURES_DIR, `${slug}.json`), "utf8"));
  const written = [];

  for (const [type, columns] of Object.entries(COLUMNS)) {
    const rows = (bundle[type] ?? []).map(flattenRow);

    if (!rows.length) continue;

    const file = join(OUT_DIR, `${slug}-${type}.csv`);
    writeFileSync(file, toCsv(columns, rows));
    written.push(`${slug}-${type}.csv (${rows.length} rows)`);
  }

  return written;
}

const requested = process.argv.slice(2);
const slugs = requested.length
  ? requested
  : readdirSync(FIXTURES_DIR)
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.replace(/\.json$/, ""));

mkdirSync(OUT_DIR, { recursive: true });

for (const slug of slugs) {
  for (const line of convert(slug)) console.log(line);
}
