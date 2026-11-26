# 0001. Add automated quality gates and ratchet down legacy lint debt

- Status: accepted
- Date: 2026-11-26
- Deciders: Nina

## Context
The site had no tests, linter or CI; only `tsc`. Changes were checked by hand, then
deployed by hand. Biome's recommended rules flag 39 errors and ~150 warnings in existing
code, and ~100 files didn't match any one formatting style.

## Options considered
1. **Gate everything immediately**: fix all 39 errors now. Big risky diff mixed with setup.
2. **Gate only changed files** (`biome --changed`): legacy problems stay invisible; main
   can never be fully checked.
3. **Format once, then gate the whole repo, with per-file exceptions for existing errors**:
   one formatting-only commit (ignored by blame), the rules stay errors for new code, and
   the exception list can only shrink.

## Decision
Option 3. It keeps every future diff clean and makes debt visible and finite.

## Update 2026-11-26
The debt list is gone: all 39 errors fixed or, where the code is intentionally right, marked
with a one-line `biome-ignore` and its reason. The rules now apply to every file.

## Consequences
- Good: CI, hooks and pre-commit all run one gate (`make check-fast` / `make check`).
- Cost: hook tests need `uv` (Python) in a Node repo; CI installs it.
- Cost: coverage floor applies to a ratchet list of tested modules, not the whole app yet.
