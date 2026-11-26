# Progress

> Updated by the `handoff` skill. The SessionStart hook prints this file into every session.

## Current goal
Quality gates in place (branch `chore/claude-quality-gates`); next, pick the first
improvement from "Next".

## Done
- 2026-10-03 Redesign + Georgian admin deployed (906d63a), booking note hotfix (63b72cb).
- 2026-11-26 Biome + Vitest, codebase formatted (647b134), Claude Code hooks/skills/agents,
  CI, docs. 32 unit tests; lint debt scoped per file in `biome.jsonc`.

## In progress
- (nothing)

## Blocked (needs the owner / Nina)
- Opening hours, booking confirmation time (`client/src/lib/studioFacts.ts`), per-treatment
  durations: no data yet.
- Address says Vepkhistkaosani 22/24 but the map pin query is 20/22. Which is right?
- Caddy compression + cache headers (docs/DEPLOY.md): needs a careful server-side edit.

## Next (candidates, highest value first)
1. Security: 20 known-vulnerable production dependencies (1 critical, 11 high) per
   `make audit`; most have non-breaking fixes (`npm audit fix`), a few need majors
   (drizzle-orm, nodemailer, zod).
2. Security/cost: `POST /api/chat` is public and calls Gemini, but the site no longer uses
   it, and its prompt has a stale address and services. Remove it (or rate-limit it).
3. Production image runs Node 20, end-of-life since April 2026: move the Dockerfile to Node 22.
4. Burn down LEGACY DEBT in `biome.jsonc` (a11y + React hook deps first), with tests.
5. Tests for the booking flow (server route validation, offer expiry in UTC+4).

## Open questions
- Should the AI chat come back? If yes, it needs evals, a rate limit and a current prompt.
