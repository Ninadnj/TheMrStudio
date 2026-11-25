import json
import subprocess
import sys
from pathlib import Path

import pytest

from tests.hooks.conftest import HOOKS, RunHook, fixture


def _decision(stdout: str) -> str | None:
    if not stdout.strip():
        return None
    return json.loads(stdout)["hookSpecificOutput"]["permissionDecision"]


@pytest.mark.parametrize(
    ("tool", "rel_path", "expected"),
    [
        ("Read", ".env", "deny"),
        ("Read", ".env.local", "deny"),
        ("Edit", "config/.env.production", "deny"),
        ("Write", ".env", "deny"),
        ("Read", "secrets/api.key", "deny"),
        ("Read", ".env.example", None),
        ("Edit", ".env.example", None),
        ("Edit", "uv.lock", "deny"),
        ("Write", "frontend/package-lock.json", "deny"),
        ("Read", "uv.lock", None),
        ("Edit", ".github/workflows/ci.yml", "ask"),
        ("Read", ".github/workflows/ci.yml", None),
        ("Edit", "server/routes.ts", None),
        ("MultiEdit", "uv.lock", "deny"),
        ("Read", ".ENV", "deny"),
        ("Read", "Secrets/x.key", "deny"),
        ("Edit", ".GitHub/Workflows/ci.yml", "ask"),
        ("Edit", ".claude/settings.json", "ask"),
        ("Write", "scripts/hooks/new_hook.py", "ask"),
        ("Edit", ".claude/agents/code-reviewer.md", "ask"),
        ("Edit", ".githooks/pre-commit", "ask"),
        ("Edit", "Makefile", "ask"),
        ("Edit", "package.json", "ask"),
        ("Edit", "biome.jsonc", "ask"),
        ("Edit", "vitest.config.ts", "ask"),
        ("Edit", "tsconfig.json", "ask"),
        ("Edit", "Dockerfile", "ask"),
        ("Edit", "docker-compose.yml", "ask"),
        ("Write", "package-lock.json", "deny"),
        ("Edit", "client/src/components/Hero.tsx", None),
        ("Read", "Makefile", None),
        ("Edit", ".claude/skills/review/SKILL.md", None),
    ],
)
def test_file_decisions(
    run_hook: RunHook, tmp_path: Path, tool: str, rel_path: str, expected: str | None
) -> None:
    payload = fixture(
        "pre_tool_use_edit", tool_name=tool, tool_input={"file_path": str(tmp_path / rel_path)}
    )
    result = run_hook("pre_file_guard.py", payload)
    assert result.returncode == 0
    assert _decision(result.stdout) == expected


def test_grep_on_env_file_is_denied(run_hook: RunHook, tmp_path: Path) -> None:
    payload = fixture(
        "pre_tool_use_edit",
        tool_name="Grep",
        tool_input={"pattern": "KEY", "path": str(tmp_path / ".env")},
    )
    payload["tool_input"].pop("file_path")
    assert _decision(run_hook("pre_file_guard.py", payload).stdout) == "deny"


def test_deny_reason_is_given(run_hook: RunHook, tmp_path: Path) -> None:
    payload = fixture("pre_tool_use_edit", tool_input={"file_path": str(tmp_path / "uv.lock")})
    out = json.loads(run_hook("pre_file_guard.py", payload).stdout)
    assert "npm install" in out["hookSpecificOutput"]["permissionDecisionReason"]


def test_symlink_to_env_is_denied(run_hook: RunHook, tmp_path: Path) -> None:
    (tmp_path / ".env").write_text("KEY=1")
    link = tmp_path / "notes.txt"
    link.symlink_to(tmp_path / ".env")
    payload = fixture("pre_tool_use_edit", tool_name="Read", tool_input={"file_path": str(link)})
    assert _decision(run_hook("pre_file_guard.py", payload).stdout) == "deny"


def test_relative_path_is_resolved_against_project(run_hook: RunHook) -> None:
    payload = fixture("pre_tool_use_edit", tool_name="Read", tool_input={"file_path": ".env"})
    assert _decision(run_hook("pre_file_guard.py", payload).stdout) == "deny"


@pytest.mark.parametrize("stdin", ["not json", '{"tool_input": []}', ""])
def test_malformed_input_fails_closed(stdin: str) -> None:
    result = subprocess.run(
        [sys.executable, str(HOOKS / "pre_file_guard.py")],
        input=stdin,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 2
