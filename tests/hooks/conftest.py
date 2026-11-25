"""Hook tests run the real scripts as subprocesses with sample JSON on stdin,
exactly as Claude Code does."""

from __future__ import annotations

import copy
import json
import os
import subprocess
import sys
from collections.abc import Callable
from pathlib import Path
from typing import Any

import pytest

ROOT = Path(__file__).resolve().parents[2]
HOOKS = ROOT / "scripts" / "hooks"
FIXTURES = Path(__file__).parent / "fixtures"

RunHook = Callable[..., subprocess.CompletedProcess[str]]


def fixture(name: str, **overrides: Any) -> dict[str, Any]:
    """Load tests/hooks/fixtures/<name>.json and deep-merge top-level dict overrides."""
    data: dict[str, Any] = json.loads((FIXTURES / f"{name}.json").read_text())
    data = copy.deepcopy(data)
    for key, value in overrides.items():
        if isinstance(value, dict) and isinstance(data.get(key), dict):
            data[key].update(value)
        else:
            data[key] = value
    return data


@pytest.fixture
def run_hook(tmp_path: Path) -> RunHook:
    def _run(
        script: str,
        payload: dict[str, Any],
        *args: str,
        project_dir: Path | None = None,
        env: dict[str, str] | None = None,
    ) -> subprocess.CompletedProcess[str]:
        full_env = {**os.environ, "CLAUDE_PROJECT_DIR": str(project_dir or tmp_path), **(env or {})}
        return subprocess.run(
            [sys.executable, str(HOOKS / script), *args],
            input=json.dumps(payload),
            capture_output=True,
            text=True,
            cwd=project_dir or tmp_path,
            env=full_env,
            timeout=60,
        )

    return _run


def git_init(path: Path, branch: str = "main") -> None:
    def git(*a: str) -> None:
        subprocess.run(["git", *a], cwd=path, check=True, capture_output=True)

    git("init", "-q", "-b", branch)
    git("config", "user.email", "test@example.com")
    git("config", "user.name", "Test")
    git("config", "commit.gpgsign", "false")
