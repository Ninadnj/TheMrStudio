---
name: handoff
description: Update docs/PROGRESS.md so the next session can continue without this conversation. Use at the end of a work session, before a long break or context compaction, when the user says "handoff", "wrap up", "save progress", "where are we", or after finishing/abandoning a task.
---

# Handoff

## Checklist
1. Gather facts, not memory: `git status`, `git log --oneline -10`, `git diff --stat`,
   and the result of the last `make check-fast` (run it if unsure).
2. Rewrite `docs/PROGRESS.md` sections (keep it under ~80 lines):
   - **Current goal**: one line.
   - **Done**: completed items this session, with commit hashes where they exist.
   - **In progress**: what is half-done, which files, what the next concrete step is.
   - **Blocked**: what, and what/who unblocks it.
   - **Next**: ordered, small, actionable.
   - **Open questions** for the user.
   Delete stale entries; this is a status board, not a log.
3. If the user corrected you this session, make sure each lesson is in `docs/LEARNINGS.md`.

## Verification (mandatory)
Show the new PROGRESS.md diff (`git diff docs/PROGRESS.md`) and state whether checks were
green at handoff time (with the command output tail).
