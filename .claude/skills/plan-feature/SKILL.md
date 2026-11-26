---
name: plan-feature
description: Turn an idea or feature request into a written spec at docs/specs/<feature>.md before any code is written. Use when the user describes new functionality, says "let's build/add X", "plan", "spec", or when a change touches more than one module, the booking flow, or the admin. Do not use for one-line fixes or bugs (use debug).
argument-hint: "[feature idea]"
---

# Plan a feature

Feature: $ARGUMENTS

Output is a spec, **not code**. Do not create or edit anything under `client/`, `server/`, `shared/` or `tests/`.

## Checklist
1. Read `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/PROGRESS.md` and the code this touches.
2. If the request is ambiguous on scope or success criteria, ask the user (max 3 questions)
   before writing.
3. Copy `docs/specs/_template.md` to `docs/specs/<kebab-feature-name>.md` and fill in:
   - **Goal** (user-visible outcome) and **Non-goals**.
   - **Acceptance criteria**: each one testable (Given/When/Then), numbered AC1..n.
   - **Test plan**: one row per AC with the planned `tests/...::test_name`.
   - **UI plan** for visible changes: which screens, KA/EN copy (Nina approves wording),
     phone + desktop, light/dark, reduced motion, and what the owner edits in the admin.
   - **Risks** with mitigations: data (no `db:push`; tables are created on server start),
     privacy of bookings, admin auth, deploy (manual, docs/DEPLOY.md).
4. If the plan makes a real architectural choice, draft an ADR with the `adr` skill.
5. Add the feature to "Next" in `docs/PROGRESS.md`.

## Verification (mandatory)
- Every AC maps to at least one row in the test plan. Say so explicitly, or list gaps.
- `git status` shows only files under `docs/` changed.
- End by showing the spec path and asking the user to approve it before implementation.
