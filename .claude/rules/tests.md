---
paths:
  - "tests/**"
---

# Writing tests

- Vitest, in `tests/unit/*.test.ts`. Import app code via `@/...` (client/src) and
  `@shared/...`. Hook tests are Python in `tests/hooks/` (run by `make test-hooks`).
- Test behavior through exported functions/hooks, not private helpers or call counts.
- One behavior per test; the name says what must hold.
- Use `it.each` tables instead of copy-pasted tests.
- Cover: empty/null, Georgian and English text, very long input, malformed data, the
  Tbilisi time zone (UTC+4, e.g. offers run through their whole expiry day), and the
  owner-editable data paths (price menu, studio info) with defaults vs saved values.
- `tests/unit/`: no network, no database, no real timers (`vi.useFakeTimers`). Mock
  `@tanstack/react-query` / `react` the way `tests/unit/hooks.test.ts` does.
- `tests/integration/`: storage against real Postgres in-process (PGlite), see
  `storage.pglite.test.ts`. Never point a test at the Neon/production database.
- When a module gets tests, add it to `coverage.include` in `vitest.config.ts` (ratchet).
  Never remove one to make the gate pass.
- A bug fix starts with a regression test that fails before the fix. Keep it.
- Never delete, skip or loosen a failing test to get green. Fix the code or ask.
