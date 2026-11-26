#!/usr/bin/env python3
"""SessionStart: print git state + docs/PROGRESS.md. Stdout becomes Claude's context."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

MAX_STATUS_LINES = 30
MAX_PROGRESS_LINES = 120


def _git(args: list[str], cwd: Path) -> str:
    try:
        out = subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, timeout=5)
    except (OSError, subprocess.SubprocessError):
        return ""
    return out.stdout.strip() if out.returncode == 0 else ""


def build_context(project_dir: Path) -> str:
    lines = ["## Session context (SessionStart hook)"]
    if not _git(["rev-parse", "--is-inside-work-tree"], project_dir):
        lines.append("Not a git repository yet.")
    else:
        branch = _git(["branch", "--show-current"], project_dir) or "(detached HEAD)"
        lines.append(f"Branch: {branch}")
        status = _git(["status", "--short"], project_dir).splitlines()
        if status:
            lines.append(f"Uncommitted changes ({len(status)}):")
            lines += [f"  {s}" for s in status[:MAX_STATUS_LINES]]
            if len(status) > MAX_STATUS_LINES:
                lines.append(f"  ... and {len(status) - MAX_STATUS_LINES} more")
        else:
            lines.append("Working tree clean.")
        log = _git(["log", "--oneline", "-5"], project_dir)
        lines.append("Last 5 commits:")
        lines += [f"  {c}" for c in (log.splitlines() or ["(no commits yet)"])]

    progress = project_dir / "docs" / "PROGRESS.md"
    lines.append("")
    if progress.is_file():
        text = progress.read_text(encoding="utf-8").splitlines()
        lines.append("## docs/PROGRESS.md")
        lines += text[:MAX_PROGRESS_LINES]
        if len(text) > MAX_PROGRESS_LINES:
            lines.append(f"... (truncated, {len(text)} lines total)")
    else:
        lines.append("docs/PROGRESS.md missing: create it with the handoff skill.")
    return "\n".join(lines)


def main() -> int:
    payload: dict[str, Any]
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        payload = {}
    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR") or payload.get("cwd") or ".")
    print(build_context(project_dir))
    return 0


if __name__ == "__main__":
    sys.exit(main())
