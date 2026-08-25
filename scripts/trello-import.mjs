#!/usr/bin/env node
/**
 * trello-import.mjs — batch-create Trello cards (with descriptions and
 * checklists) from a JSON file, via the Trello REST API.
 *
 * Usage:
 *   TRELLO_KEY=... TRELLO_TOKEN=... node scripts/trello-import.mjs --board <shortLink> [options]
 *
 * Options:
 *   --board <id>   Board id or the short link from the board URL
 *                  (trello.com/b/<shortLink>/name). Omit it (with credentials
 *                  set) to print your open boards and their short links.
 *   --data <path>  Cards JSON (default: scripts/wsol26-trello-cards.json).
 *   --list <name>  Target list. Reuses an existing list with that name on the
 *                  board (case-insensitive) or creates it at the end. Default
 *                  comes from the JSON file ("WSOL26").
 *   --dry-run      Print what would be created; no API writes.
 *
 * Credentials (never hardcode, never commit):
 *   TRELLO_KEY   — from https://trello.com/power-ups/admin (create a Power-Up,
 *                  then "API key").
 *   TRELLO_TOKEN — from the "Token" link next to your API key (manual token).
 *
 * JSON shape: { list: string, cards: [{ name, desc, checklists: [{ name, items: [string] }] }] }
 */

import { readFile } from "node:fs/promises";

const API = "https://api.trello.com/1";
const KEY = process.env.TRELLO_KEY;
const TOKEN = process.env.TRELLO_TOKEN;

function opt(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const BOARD = opt("--board", null);
const DATA = opt("--data", "scripts/wsol26-trello-cards.json");
const DRY = process.argv.includes("--dry-run");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function api(method, path, params = {}) {
  const url = new URL(`${API}${path}`);
  url.searchParams.set("key", KEY);
  url.searchParams.set("token", TOKEN);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { method });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  // Gentle pacing: Trello allows 300 requests / 10 s per key.
  await new Promise((r) => setTimeout(r, 120));
  return res.json();
}

async function main() {
  if (!BOARD) {
    if (!KEY || !TOKEN) {
      fail("Missing --board. Tip: set TRELLO_KEY and TRELLO_TOKEN and run without --board to list your boards.");
    }
    const boards = await api("GET", "/members/me/boards", { fields: "name,shortLink,url", filter: "open" });
    if (!boards.length) fail("No open boards on this account — create the board in Trello first.");
    console.log("Your open boards — re-run with --board <shortLink>:\n");
    for (const b of boards) console.log(`  ${b.shortLink}  ${b.name}\n            ${b.url}`);
    return;
  }
  const data = JSON.parse(await readFile(DATA, "utf8"));
  const listName = opt("--list", data.list || "Imported");
  const cards = data.cards || [];
  const totals = cards.reduce(
    (t, c) => {
      t.checklists += (c.checklists || []).length;
      t.items += (c.checklists || []).reduce((n, cl) => n + (cl.items || []).length, 0);
      return t;
    },
    { checklists: 0, items: 0 },
  );

  console.log(`Plan: list "${listName}" + ${cards.length} cards, ${totals.checklists} checklists, ${totals.items} items.`);
  if (DRY) {
    for (const card of cards) {
      console.log(`\n■ ${card.name}`);
      for (const cl of card.checklists || []) console.log(`  ☑ ${cl.name} (${(cl.items || []).length} items)`);
    }
    console.log("\nDry run — nothing sent to Trello.");
    return;
  }

  if (!KEY || !TOKEN) fail("Set TRELLO_KEY and TRELLO_TOKEN environment variables (see header comment).");

  const board = await api("GET", `/boards/${BOARD}`, { fields: "name,url" });
  console.log(`Board: ${board.name} (${board.url})`);

  const existing = await api("GET", `/boards/${board.id}/lists`, { fields: "name" });
  const wanted = listName.trim().toLowerCase();
  const found = existing.find((l) => l.name.trim().toLowerCase() === wanted);
  const list = found ?? (await api("POST", "/lists", { name: listName, idBoard: board.id, pos: "bottom" }));
  console.log(found ? `List: ${list.name} (existing — cards appended at the bottom)` : `List created: ${list.name}`);

  for (const card of cards) {
    const created = await api("POST", "/cards", {
      idList: list.id,
      name: card.name,
      desc: card.desc || "",
      pos: "bottom",
    });
    console.log(`■ ${created.name}`);
    for (const cl of card.checklists || []) {
      const checklist = await api("POST", "/checklists", { idCard: created.id, name: cl.name, pos: "bottom" });
      for (const item of cl.items || []) {
        await api("POST", `/checklists/${checklist.id}/checkItems`, { name: item, pos: "bottom" });
      }
      console.log(`  ☑ ${cl.name} (${(cl.items || []).length} items)`);
    }
  }
  console.log(`\n✓ Done: ${cards.length} cards on "${list.name}" in ${board.name}.`);
}

main().catch((error) => fail(error.message));
