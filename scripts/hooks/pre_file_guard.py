#!/usr/bin/env python3
"""PreToolUse(Read|Edit|Write|MultiEdit|NotebookEdit|Grep): protect sensitive files.

- .env* (except .env.example) and secrets/**: denied for read AND write.
- lockfiles: denied for write. They are generated; run `uv add` / `uv lock` instead.
- the enforcement layer and deploy config (settings, hooks, agents, git hooks, Makefile,
  package.json, tool configs, CI, Docker): writes need explicit approval ("ask").
Checks both the given path and its symlink-resolved target, case-insensitively.
Any crash blocks the call (fail closed).
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, cast

WRITE_TOOLS = {"Edit", "Write", "MultiEdit", "NotebookEdit"}
LOCKFILES = {
    "uv.lock", "poetry.lock", "pipfile.lock", "package-lock.json", "pnpm-lock.yaml",
    "yarn.lock", "bun.lockb", "bun.lock", "cargo.lock", "go.sum",
}  # fmt: skip
ENV_FILE = re.compile(r"^\.env(\..+)?$", re.I)
# Paths (lowercase, relative to the project) whose edits weaken or change the gates.
PROTECTED_PREFIXES: tuple[tuple[str, ...], ...] = (
    (".claude", "settings.json"),
    (".claude", "settings.local.json"),
    (".claude", "agents"),
    ("scripts", "hooks"),
    (".githooks",),
    (".github", "workflows"),
    ("makefile",),
    ("package.json",),
    ("biome.jsonc",),
    ("vitest.config.ts",),
    ("tsconfig.json",),
    ("drizzle.config.ts",),
    ("dockerfile",),
    ("docker-compose.yml",),
)


def _decision(kind: str, reason: str) -> None:
    out = {"hookEventName": "PreToolUse", "permissionDecision": kind}
    out["permissionDecisionReason"] = reason
    print(json.dumps({"hookSpecificOutput": out}))


def _rel_parts(path: Path, project_dir: Path) -> tuple[str, ...]:
    try:
        rel = path.relative_to(project_dir)
    except ValueError:
        return tuple(p.lower() for p in path.parts)
    return tuple(p.lower() for p in rel.parts)


def classify(tool: str, file_path: str, project_dir: Path) -> tuple[str, str] | None:
    """Return (decision, reason) or None to fall through to normal permissions."""
    project = project_dir.resolve()
    given = Path(file_path) if Path(file_path).is_absolute() else project / file_path
    candidates = {given.absolute(), given.resolve()}  # the path and its symlink target
    verdict: tuple[str, str] | None = None
    for path in candidates:
        parts = _rel_parts(path, project)
        name = path.name
        if ENV_FILE.match(name) and name.lower() != ".env.example":
            return "deny", f"{name} may hold secrets. Edit it yourself; Claude uses .env.example."
        if "secrets" in parts:
            return "deny", "secrets/ is off-limits to the agent."
        if tool not in WRITE_TOOLS:
            continue
        if name.lower() in LOCKFILES:
            return "deny", f"{name} is generated. Use `npm install <pkg>` or `npm uninstall <pkg>`."
        if any(parts[: len(p)] == p for p in PROTECTED_PREFIXES):
            verdict = ("ask", f"{'/'.join(parts)} is part of the quality gates: approve only if "
                       "you asked for this change.")  # fmt: skip
    return verdict


def main() -> int:
    payload = json.loads(sys.stdin.read())
    tool = str(payload.get("tool_name", ""))
    raw = payload.get("tool_input")
    if not isinstance(raw, dict):
        raise ValueError("tool_input is not an object")
    tool_input = cast(dict[str, Any], raw)
    file_path = tool_input.get("file_path") or tool_input.get("notebook_path")
    if not file_path and tool == "Grep":
        file_path = tool_input.get("path")
    if not file_path:
        return 0
    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR") or payload.get("cwd") or ".")
    verdict = classify(tool, str(file_path), project_dir)
    if verdict:
        _decision(*verdict)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # fail closed
        print(f"BLOCKED: pre_file_guard crashed ({type(exc).__name__}: {exc})", file=sys.stderr)
        sys.exit(2)
