---
name: ship
description: Prepare a change for merge - full checks, production build, CHANGELOG, conventional commit on a branch, PR description, deploy notes. Use only when the user explicitly asks to ship, release, open a PR or "wrap this up for review".
disable-model-invocation: true
argument-hint: "[short summary]"
---

# Ship

Never push to `main`/`master`, never force-push, never `--no-verify` (hooks block these).

## Checklist
1. If on `main`/`master`, create a branch: `git switch -c <type>/<short-name>`.
2. `make check` must be green. Paste the tail. If red: stop and fix (or use `debug`).
3. UI changes: confirm the browser check from `implement-feature` was done (or do it now).
4. Update `CHANGELOG.md` → `[Unreleased]` (Added / Changed / Fixed / Security).
5. Update `docs/PROGRESS.md` via the `handoff` skill.
6. Stage specific files (`git add <paths>`, not `-A` blindly; never `.env*`).
   Commit with Conventional Commits: `type(scope): summary` + body (what and why).
7. Draft the PR description in a fenced block:
   Summary · Why · Changes · How verified (actual commands + results) · Screens checked ·
   Risks / rollback · Deploy notes (does it need a droplet rebuild? DB tables? Caddy?).
8. Ask the user before `git push -u origin <branch>` and before `gh pr create`
   (both are outward-facing). Settings make `git push` an ask, not an allow.

## Verification (mandatory)
`git log --oneline -3`, `git status` (clean), the `make check` output tail, and the PR
draft. Remind Nina that merging does NOT deploy: the droplet must be rebuilt by hand
(docs/DEPLOY.md), and only with her OK. State clearly what was NOT pushed or created yet.
