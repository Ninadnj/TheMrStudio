---
name: debug
description: Find and fix a bug at its root cause, starting from a failing regression test. Use when something is broken, a test fails unexpectedly, there is an error/traceback, wrong output, flaky behavior, or the user says "bug", "doesn't work", "why does X".
argument-hint: "[symptom or error]"
---

# Debug

Symptom: $ARGUMENTS

## Checklist
1. **Reproduce first.** Write a test that fails because of the bug (unit if possible).
   Run it and confirm it fails with the reported symptom. No fix before this exists.
   If you cannot reproduce, say so and collect more data (inputs, logs, versions).
2. **Hypothesize.** Write down 1–3 candidate causes and the evidence that would
   distinguish them.
3. **Isolate.** Narrow with the smallest experiment: shrink the input, bisect
   (`git log`, `git bisect` with the user's OK), add temporary asserts/prints. Remove them after.
4. **Fix the root cause**, not the symptom. A try/except that hides the error, a special
   case for the test input, or a sleep for a race is not a fix.
5. Check for the same bug elsewhere (`grep` the pattern) and cover those too.
6. Keep the regression test. Name it after the behavior, not the ticket.
7. If the cause is a lesson worth keeping, append it to `docs/LEARNINGS.md`.

## Verification (mandatory)
- Show the regression test failing before the fix and passing after (both outputs).
- `make check-fast` green; paste the tail.
- One sentence: root cause, and why the fix addresses it rather than the symptom.
