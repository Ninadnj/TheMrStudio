---
paths:
  - "scripts/hooks/**"
  - ".claude/settings.json"
  - ".claude/agents/**"
---

# Hooks and Claude config

- Hooks are the enforcement layer. A rule that must always hold goes here, not in CLAUDE.md.
- Stdlib-only Python, executable (`chmod +x`), fast (PreToolUse < 1s, PostToolUse < 5s).
- Contract: read JSON from stdin; exit 0 = allow, exit 2 = block (stderr goes to Claude);
  PreToolUse may print `hookSpecificOutput.permissionDecision` JSON instead.
- Every hook change ships with tests in `tests/hooks/` using fixtures in
  `tests/hooks/fixtures/` (real Claude Code input shapes).
- Never loosen a guard to unblock yourself. Ask the user.
- Docs: https://code.claude.com/docs/en/hooks
