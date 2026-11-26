# Progress

> Updated by the `handoff` skill. The SessionStart hook prints this file into every session.

## Current goal
Quality gates in place (branch `chore/claude-quality-gates`); next, pick the first
improvement from "Next".

## Done
- 2026-11-26 Accessibility: all 39 lint errors cleared, LEGACY DEBT list deleted. Fixes:
  lightbox video muted (autoplay on phones), named groups in the booking sheet, wordmark and
  admin badge readable by screen readers, admin booking cards no longer remount every 30 s,
  admin Confirm button no longer clipped on phones. 28 unused shadcn components and 21 unused
  packages removed. Intentional exceptions are one-line `biome-ignore`s with reasons.
- 2026-11-26 Speed: the app compresses (JS 269→87 KB, CSS 123→22 KB) and caches hashed
  assets for a year; no Caddy edit needed. Measured locally on the production build:
  first paint 120 ms, largest paint (hero image) 140 ms, layout shift 0.
- 2026-10-03 Redesign + Georgian admin deployed (906d63a), booking note hotfix (63b72cb).
- 2026-11-26 Admin buttons visible again (login, Offers add, Gallery add): the redesign
  had removed `.bg-theme-accent`; a test now checks every `*-theme-*` utility exists.
- 2026-11-26 Dependencies: 20 production vulnerabilities → 0 (branch fix/vulnerable-deps),
  zod 4 migration with tests guarding the Georgian validation messages, storage tested on
  real Postgres (PGlite).
- 2026-11-26 Biome + Vitest, codebase formatted (647b134), Claude Code hooks/skills/agents,
  CI, docs. 32 unit tests; lint debt scoped per file in `biome.jsonc`.

## In progress
- (nothing)

## Blocked (needs the owner / Nina)
- A cosmetology photo: the Aesthetics services tile fills automatically once a gallery image
  with category კოსმეტოლოგია exists (Admin → გალერეა).
- Opening hours, booking confirmation time (`client/src/lib/studioFacts.ts`), per-treatment
  durations: no data yet.
- Address says Vepkhistkaosani 22/24 but the map pin query is 20/22. Which is right?

## Next (candidates, highest value first)
1. Security/cost: `POST /api/chat` is public and calls Gemini, but the site no longer uses
   it, its prompt has a stale address and services, and it calls the experimental
   model `gemini-2.0-flash-exp`. Remove it (or rate-limit and update it).
2. Production image runs Node 20, end-of-life since April 2026: move the Dockerfile to Node 22.
3. Tests for the booking flow (server route validation, offer expiry in UTC+4).

## Found, not fixed
- Admin: the page CSP (`server/index.ts`) blocks a `blob:` web worker (likely the image
  uploader's), logged on admin load. Pre-existing; check uploads still make thumbnails.

## Open questions
- Should the AI chat come back? If yes, it needs evals, a rate limit and a current prompt.
