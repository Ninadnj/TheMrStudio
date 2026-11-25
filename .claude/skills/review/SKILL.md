---
name: review
description: Review the current change with the code-reviewer subagent in a fresh context, then apply only the real fixes. Use after implementing something, before committing or shipping, or when the user says "review", "check my diff", "anything wrong with this".
argument-hint: "[base ref, default: main]"
---

# Review the current diff

## Checklist
1. Determine the diff: `git status` and `git diff` (unstaged + staged) plus, on a branch,
   `git diff <base>...HEAD` (base: "$ARGUMENTS", or `main` if empty). If empty, say so and stop.
2. Delegate to the **code-reviewer** subagent. Give it: the base ref, the list of changed
   files, and the spec path if one exists. Do not include your own opinion of the code
   (fresh context = honest review). For LLM-facing or security-relevant changes also run
   the **security-auditor** subagent.
3. Triage each finding: **real** (bug, security issue, missing test for changed
   behavior, spec violation) vs **noise** (style the linters already enforce, taste,
   speculative). Be honest; do not dismiss a finding because it is inconvenient.
4. Fix the real ones, highest severity first. Each bug fix gets a regression test.
5. Run `make check-fast`.

## Verification (mandatory)
Report a table: finding (file:line) · verdict (fixed / not a problem + why / deferred +
where noted) · and paste the tail of `make check-fast`.
