# Learnings

Lessons from corrections, so they aren't repeated. Append, don't rewrite.
Format: `- YYYY-MM-DD — <what went wrong> → <rule from now on>`
If a lesson must hold every time, turn it into a hook, test or CI check and note it here.

- 2026-10-03 — Generated Georgian slogans and intro lines were cut as "not smart" →
  use facts + the brand name; ask Nina for any marketing wording.
- 2026-10-03 — `npm run db:push` is `--force` and would drop tables on the live DB →
  never run it; tables are created by `ensureContent` (now blocked by `pre_bash_guard.py`).
- 2026-10-03 — Replacing the host Caddyfile did not change the running config (single-file
  bind mount keeps the old inode) → edit in place or recreate the container (docs/DEPLOY.md).
