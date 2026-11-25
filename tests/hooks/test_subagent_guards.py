from pathlib import Path

import pytest

from tests.hooks.conftest import RunHook, fixture


@pytest.mark.parametrize(
    ("command", "allowed"),
    [
        ("git diff", True),
        ("git diff --stat main...HEAD", True),
        ("git log --oneline -10", True),
        ("npm ls --depth 0", True),
        ("git push origin feat", False),
        ("git diff > out.txt", False),
        ("git diff; rm x", False),
        ("python -c 'import os'", False),
        ("git checkout -- .", False),
        ("git log -p -- server/routes.ts", True),
        ("git status\ntouch server/x.ts", False),
        ("git diff --output=server/routes.ts", False),
        ("git grep --open-files-in-pager=touch x", False),
        ("make lint", False),
        ("ls -la", True),
    ],
)
def test_readonly_bash(run_hook: RunHook, command: str, allowed: bool) -> None:
    payload = fixture("pre_tool_use_bash", tool_input={"command": command})
    result = run_hook("subagent_guards.py", payload, "readonly-bash")
    assert result.returncode == (0 if allowed else 2), result.stderr


@pytest.mark.parametrize(
    ("rel_path", "allowed"),
    [
        ("tests/unit/new.test.ts", True),
        ("tests/unit/studio.test.ts", True),
        ("client/src/lib/studio.ts", False),
        ("server/routes.ts", False),
        ("package.json", False),
    ],
)
def test_tests_only(run_hook: RunHook, tmp_path: Path, rel_path: str, allowed: bool) -> None:
    payload = fixture("pre_tool_use_edit", tool_input={"file_path": str(tmp_path / rel_path)})
    result = run_hook("subagent_guards.py", payload, "tests-only")
    assert result.returncode == (0 if allowed else 2), result.stderr


def test_outside_project_is_blocked(run_hook: RunHook) -> None:
    payload = fixture("pre_tool_use_edit", tool_input={"file_path": "/etc/hosts"})
    assert run_hook("subagent_guards.py", payload, "tests-only").returncode == 2


@pytest.mark.parametrize(
    ("command", "allowed"),
    [
        ("npx vitest run tests/unit/studio.test.ts", True),
        ("npx vitest run -t toStudio tests/unit", True),
        ("make test-fast", True),
        ("sed -i 's/a/b/' client/src/lib/studio.ts", False),
        ("printf x > server/routes.ts", False),
        ("npx vitest run --outputFile=server/x.json tests", False),
        ("npx vitest run client/", False),
        ("node -e 'require(1)'", False),
    ],
)
def test_tests_bash(run_hook: RunHook, command: str, allowed: bool) -> None:
    payload = fixture("pre_tool_use_bash", tool_input={"command": command})
    result = run_hook("subagent_guards.py", payload, "tests-bash")
    assert result.returncode == (0 if allowed else 2), result.stderr


def test_unknown_guard_blocks(run_hook: RunHook) -> None:
    assert run_hook("subagent_guards.py", {}, "nope").returncode == 2


def test_malformed_input_fails_closed(run_hook: RunHook) -> None:
    payload = {"tool_input": None}
    assert run_hook("subagent_guards.py", payload, "tests-bash").returncode == 2
