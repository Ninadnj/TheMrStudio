# CLAUDE.md — THE MR Studio

This file is a map. Hard rules are enforced by hooks (`scripts/hooks/`), the git
pre-commit hook and CI, not by this text. If this file and a hook disagree, the hook wins.

## Purpose
Website and booking system for THE MR Nail & Laser Studio, Tbilisi: https://themrstudio.net.
Clients browse services and prices (Georgian first, English second) and request a booking;
the owner confirms bookings and edits prices, studio info, gallery and offers in a Georgian
admin. "Working" means: booking requests reach the owner, the site is fast on phones, and
the owner can change content without a developer.

## Stack
React 18 + Vite + Tailwind (client/) · Express (server/) · Drizzle + Postgres (Neon) ·
shared zod schemas (shared/) · TypeScript strict · Biome (lint/format) · Vitest ·
Docker on a DigitalOcean droplet behind Caddy (manual deploy).

## Commands (always via make)
| Need | Command |
|---|---|
| install deps + git hook | `make setup` |
| run locally (in-memory data without `DATABASE_URL`) | `make dev` (port 5002) |
| format / safe fixes | `make fmt` |
| inner loop: lint + tsc + unit/hook tests | `make check-fast` |
| everything CI runs (+ coverage, build, secrets) | `make check` |
| known-vulnerable dependencies | `make audit` |
| lint warnings (not a gate) to burn down | `make lint-debt` |

## Architecture and sources of truth
- `docs/ARCHITECTURE.md`: modules, data flow, external services.
- `design_guidelines.md`: how the public site looks, reads and moves. Tokens live in
  `client/src/index.css`. If code and the guidelines disagree, fix one in the same change.
- `docs/DEPLOY.md`: the manual deploy recipe and the Caddy trap. Read before any deploy talk.
- Decisions: `docs/decisions/`. Specs: `docs/specs/`. Status: `docs/PROGRESS.md`.

## Workflow (every change)
1. **Explore**: read the code, `docs/PROGRESS.md`, `docs/LEARNINGS.md`, the spec if any.
2. **Plan**: non-trivial → `plan-feature` skill → `docs/specs/<feature>.md`, Nina approves.
3. **Failing test first** (Vitest, `tests/unit/`). Pure logic lives in `client/src/lib` or
   `shared/` so it can be tested.
4. **Implement** the minimum; refactor while green.
5. **`make check-fast`** (the Stop hook runs it and blocks you while it is red).
6. **UI changes**: check in the browser at 375px and 1280px, KA + EN, light + dark.
7. **Review**: `review` skill; fix real findings. **Ship**: `ship` skill (Nina types it).
8. **Handoff**: `handoff` skill updates `docs/PROGRESS.md`.

## Conventions
- Every user-facing string goes through `t(ka, en)` from `client/src/lib/i18n.tsx`.
  Georgian is formal ("თქვენ"), written first; check that long Georgian words don't clip.
- Copy: facts and the brand name only. No invented slogans, taglines or intro lines; ask
  Nina for wording. Prices read like "5 ₾-დან".
- Clients are confirmed by **email** when the owner presses Confirm, never by phone.
  All copy must say so.
- Owner-editable content (price menu, studio info, hero, gallery, offers) lives in the DB.
  Tables are created and seeded by the server on start-up
  (`DatabaseStorage.ensureContent`, `server/seed-content.ts`, `shared/studioDefaults.ts`).
- The admin is entirely in Georgian: the owner must be able to do everything herself.
- Booking categories are fixed: Manicure, Pedicure, Epilation, Cosmetology.
- Offers run through their whole expiry day, Tbilisi time (UTC+4).
- Motion respects `prefers-reduced-motion` (`client/src/lib/reveal.ts`, `.motion` class).
- No visible maker credit on the site (the console signature in `lib/signature.ts` stays).
- Admin API routes use `requireAuth`. `GET /api/bookings` is admin-only (privacy).
- Commits: Conventional Commits. Formatting-only commits go in `.git-blame-ignore-revs`.

## NEVER
- Run `npm run db:push` / `drizzle-kit push` (it is `--force`; it can drop live tables).
- Deploy, `ssh` to the droplet, or touch Caddy without Nina's explicit OK in chat.
- Read or write `.env*` (except `.env.example`) or `secrets/`.
- Hand-edit `package-lock.json`; use `npm install` / `npm uninstall` (Nina approves).
- Push to `main`, force-push, or use `--no-verify`.
- Silence lint with file-wide overrides in `biome.jsonc`. A real exception is a one-line
  `biome-ignore <rule>: <reason>` at the spot. Never drop modules from
  `coverage.include` or skip/delete failing tests to get green.
- Weaken `.claude/settings.json`, hooks, Makefile or CI to get unblocked. Ask instead.
- Add dependencies, services or frameworks that weren't asked for.
- Claim something works without running it. Paste the command and its output.

## Definition of done
- [ ] Failing test first; now passes. Edge cases (Georgian text, empty, UTC+4) covered.
- [ ] `make check-fast` green; `make check` green before shipping.
- [ ] UI: checked at 375/1280 px, KA/EN, light/dark, no console errors, no overflow.
- [ ] Docs updated where behavior changed (ARCHITECTURE, DEPLOY, design_guidelines, ADR).
- [ ] `docs/PROGRESS.md` updated; deploy needs written down for Nina.
- [ ] Final message lists the commands run and their actual results.

## Learning from corrections
When Nina corrects you, append the lesson to `docs/LEARNINGS.md` (date, mistake, rule)
in the same turn. If a lesson must *always* hold, propose a hook or test for it.
