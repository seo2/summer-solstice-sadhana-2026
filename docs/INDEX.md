# Documentation Index

Master index of every Markdown doc in this repository. **Keep this updated** whenever a
doc is added, renamed, or removed (see the documentation discipline in `CLAUDE.md`).

## Overview

| Doc | What it covers |
|---|---|
| [../README.md](../README.md) | Project front door: what the app is, stack, quick start, links |
| [PROJECT-MEMORY.md](PROJECT-MEMORY.md) | Living context & decision log: current state, decisions made, how we work, next up |
| [../PRODUCT.md](../PRODUCT.md) | Product intent: users, purpose, brand, principles, accessibility |
| [../DESIGN.md](../DESIGN.md) | Visual system captured from the current codebase |

## Process & conventions

| Doc | What it covers |
|---|---|
| [../CLAUDE.md](../CLAUDE.md) | Agent/contributor guidance: rules, git workflow, changelog & docs discipline, checklists |
| [../AGENTS.md](../AGENTS.md) | Next.js 15 warning for agents (read the bundled docs before Next changes) |
| [../CHANGELOG.md](../CHANGELOG.md) | Notable changes, Keep-a-Changelog format |
| [TESTING-LOCAL.md](TESTING-LOCAL.md) | How to test the app locally: alone, against the mock backend, against local WordPress, and in simulators |
| [STORE-OPS.md](STORE-OPS.md) | WS4 runbook: Apple/Google store chains, privacy answers, review notes, QA checklist, timeline to Nov 24 |

## Planning & architecture

| Doc | What it covers |
|---|---|
| [ROADMAP.md](ROADMAP.md) | Phased plan from PWA → backend → native → multi-event → commerce |
| [BACKEND.md](BACKEND.md) | Backend proposal, multi-event data model, sync strategy |
| [NATIVE.md](NATIVE.md) | Capacitor iOS/Android, push, widget, lock-screen "up next" |
| [LOCAL-NETWORK.md](LOCAL-NETWORK.md) | Campsite local network + edge server for offline updates/notifications |
| [FEATURES.md](FEATURES.md) | Per-feature specs, status, dependencies, and phase |
| [ACCOUNTS.md](ACCOUNTS.md) | App accounts: WordPress identity, token storage, favorites sync (merge + tombstones) |
| [MESSAGING.md](MESSAGING.md) | Messaging design: DM/group/official/work-group channels, alerts; polling-first, socket-ready |
| [TEACHERS.md](TEACHERS.md) | Teacher/presenter info spec: data model, program linking, static-first rollout |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Features & technical requirements for the native (iOS/Android) version — stakeholder-ready |
| [HANDOFF.md](HANDOFF.md) | Project handoff: state of both repos, pending QA, working knowledge, first-session checklist |
| [WSOL26-PLAN.md](WSOL26-PLAN.md) | Next-stage plan for Winter Solstice 2026 (Florida): decisions, workstreams with per-task explanations, timeline; local network out of scope |
| [BACKEND-WSOL26.md](BACKEND-WSOL26.md) | Plugin changes for the WSOL26 stage (v0.5.0/DB v3): anonymous devices + prefs, venue map, menus (implemented); checkout-feed pipeline (P4, proposed) |
| [WSOL26-TRELLO.md](WSOL26-TRELLO.md) | Trello card export of the WSOL26 plan: one card per workstream with description and checklists |
| [FUNCIONALIDADES.md](FUNCIONALIDADES.md) | Spanish-language feature summary: what exists (✅) vs new for WSOL26 (🆕), stakeholder-friendly |

## Content

| Doc | What it covers |
|---|---|
| [../TODO_CONTENT_REVIEW.md](../TODO_CONTENT_REVIEW.md) | Manual review of content extracted from the booklet PDF |

---

Reading order for someone new: **README → PRODUCT → ROADMAP**, then the specific
planning doc for the area you're working on.
