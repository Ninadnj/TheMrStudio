---
name: implement-feature
description: Implement an approved spec or a well-defined change with a strict TDD loop (failing test, minimal code, green, refactor, make check-fast). Use when the user says "implement", "build it", "go ahead" after a plan, or points at docs/specs/<feature>.md.
argument-hint: "[docs/specs/<feature>.md or short description]"
---

# Implement a feature (TDD)

Target: $ARGUMENTS

## Checklist
1. Read the spec (if any), `CLAUDE.md` conventions and `docs/LEARNINGS.md`.
2. Pick the next acceptance criterion. For each AC, loop:
   1. **Red**: write the test from the spec's test plan. Run only that test
      (`npx vitest run tests/unit/<file>.test.ts -t "<name>"`). Confirm it fails *for the expected reason*
      (assertion, not ImportError/typo).
   2. **Green**: write the minimum code to pass. No speculative options or abstractions.
   3. **Refactor** while green: names, duplication. Re-run the test.
3. UI change? Run `make dev` and check it in a browser at 375px and 1280px wide, in
   Georgian and English, light and dark, with no console errors and no horizontal scroll.
   Follow `design_guidelines.md`. New user-facing text goes through `t(ka, en)` (formal
   Georgian; no filler slogans: ask Nina for wording when unsure).
4. Run `make check-fast`. Fix every failure at the root; never skip or loosen a test.
5. Update `docs/PROGRESS.md` (done / in progress / next) and `CHANGELOG.md` (Unreleased).

## Rules
- Never write production code without a failing test that demands it. Pure logic goes in
  testable modules (`client/src/lib`, `shared/`), not inside components.
- Validate all LLM output before using it (schema/enum checks, like `parse_triage`).
- Stay inside the spec's scope; note discovered work in PROGRESS.md "Next" instead.

## Verification (mandatory)
Paste the actual tail of `make check-fast` output (and what you checked in the browser for
UI changes), list each AC
with the test that proves it, and state anything not done.
