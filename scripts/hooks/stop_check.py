#!/usr/bin/env python3
"""Stop: run `make check-fast`; if it fails, block the stop and hand Claude the output.

Loop safety:
- When stop_hook_active is true (Claude is already continuing because of this hook) we
  count retries per session; after STOP_HOOK_MAX_RETRIES (default 3) we let the turn end
  and tell the user instead of blocking again.
- Claude Code itself also caps consecutive stop-hook blocks.
Speed: a fingerprint of HEAD + working-tree changes is cached after a green run, so a
turn that changed nothing skips the check.
"""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

TAIL_LINES = 80


def _git(args: list[str], cwd: Path) -> str | None:
    try:
        out = subprocess.run(["git", *args], cwd=cwd, capture_output=True, timeout=10)
    except (OSError, subprocess.SubprocessError):
        return None
    return out.stdout.decode("utf-8", "replace") if out.returncode == 0 else None


def fingerprint(project_dir: Path) -> str | None:
    """Hash of HEAD + every changed/untracked file's content. None outside git."""
    head = _git(["rev-parse", "HEAD"], project_dir) or "no-head"
    status = _git(["status", "--porcelain=v1", "-z", "--untracked-files=all"], project_dir)
    if status is None:
        return None
    # -z: "XY path\0", renames add "orig\0"; paths are raw (no C-style quoting)
    entries: list[str] = []
    fields = status.split("\0")
    i = 0
    while i < len(fields):
        if fields[i]:
            entries.append(fields[i])
            i += 1 if fields[i][0] not in "RC" else 2
        else:
            i += 1
    digest = hashlib.sha256(head.encode())
    for entry in sorted(entries):
        rel = entry[3:]
        if rel.startswith(".claude/.state/"):
            continue  # this hook's own bookkeeping
        digest.update(entry.encode())
        path = project_dir / rel
        if path.is_file():
            digest.update(hashlib.sha256(path.read_bytes()).digest())
    return digest.hexdigest()


def _state_dir(project_dir: Path) -> Path:
    path = project_dir / ".claude" / ".state"
    path.mkdir(parents=True, exist_ok=True)
    return path


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("stop_check: invalid hook input", file=sys.stderr)
        return 1
    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR") or payload.get("cwd") or ".")
    state = _state_dir(project_dir)
    session = "".join(c for c in str(payload.get("session_id", "default")) if c.isalnum())[:64]
    retries_file = state / f"stop-retries-{session or 'default'}"
    green_file = state / "last-green-fingerprint"
    raw_max = os.environ.get("STOP_HOOK_MAX_RETRIES", "3")
    max_retries = int(raw_max) if raw_max.isdigit() else 3

    if payload.get("stop_hook_active"):
        saved = retries_file.read_text().strip() if retries_file.exists() else ""
        retries = int(saved) if saved.isdigit() else 0
        if retries >= max_retries:
            retries_file.unlink(missing_ok=True)
            print(
                json.dumps(
                    {
                        "systemMessage": f"make check-fast still failing after {retries} "
                        "automatic retries. Stopping; run `make check-fast` to see why."
                    }
                )
            )
            return 0
    else:
        retries = 0

    current = fingerprint(project_dir)
    if current and green_file.exists() and green_file.read_text() == current:
        retries_file.unlink(missing_ok=True)
        return 0

    try:
        result = subprocess.run(
            ["make", "check-fast"],
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=280,
        )
    except subprocess.TimeoutExpired:
        print("make check-fast timed out (280s). Investigate before finishing.", file=sys.stderr)
        retries_file.write_text(str(retries + 1))
        return 2

    if result.returncode == 0:
        retries_file.unlink(missing_ok=True)
        if current:
            green_file.write_text(current)
        return 0

    retries_file.write_text(str(retries + 1))
    tail = "\n".join((result.stdout + result.stderr).splitlines()[-TAIL_LINES:])
    print(
        "make check-fast FAILED. You are not done: fix the root cause, then finish.\n"
        f"--- last {TAIL_LINES} lines ---\n{tail}",
        file=sys.stderr,
    )
    return 2


if __name__ == "__main__":
    sys.exit(main())
