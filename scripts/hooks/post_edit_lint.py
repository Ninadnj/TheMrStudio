#!/usr/bin/env python3
"""PostToolUse(Edit|Write|MultiEdit): format + lint ONLY the file that changed, with Biome.

.ts .tsx .js .jsx .json .jsonc .css -> `biome check --write <file>` (format + safe fixes);
remaining errors -> exit 2 so Claude sees them immediately. Warnings are not reported here
(legacy files have many; `make lint` shows them). Target: well under 5 seconds.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".jsonc", ".css"}


def find_biome(project_dir: Path) -> str | None:
    local = project_dir / "node_modules" / ".bin" / "biome"
    if local.exists():
        return str(local)
    return shutil.which("biome")


def lint_file(path: Path, project_dir: Path) -> tuple[int, str]:
    biome = find_biome(project_dir)
    if biome is None:
        return 1, "biome not found: run `make setup`."
    result = subprocess.run(
        [
            biome,
            "check",
            "--write",
            "--colors=off",
            "--diagnostic-level=error",
            "--no-errors-on-unmatched",
            "--files-ignore-unknown=true",
            # Claude often adds an import one edit before the code that uses it; don't delete
            # it mid-edit. `make check-fast` (Stop hook) still catches leftovers.
            "--skip=correctness/noUnusedImports",
            str(path),
        ],
        cwd=project_dir,
        capture_output=True,
        text=True,
        timeout=30,
    )
    if result.returncode != 0:
        output = (result.stdout + result.stderr).strip()
        return 2, f"biome found problems in {path}. Fix them now:\n{output}"
    return 0, ""


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("post_edit_lint: invalid hook input", file=sys.stderr)
        return 1
    file_path = (payload.get("tool_input") or {}).get("file_path")
    if not file_path:
        return 0
    path = Path(file_path)
    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR") or payload.get("cwd") or ".")
    if not path.is_file() or path.suffix not in SUFFIXES:
        return 0
    try:
        path.resolve().relative_to(project_dir.resolve())
    except ValueError:
        return 0  # never touch files outside the project
    code, message = lint_file(path, project_dir)
    if message:
        print(message, file=sys.stderr)
    return code


if __name__ == "__main__":
    sys.exit(main())
