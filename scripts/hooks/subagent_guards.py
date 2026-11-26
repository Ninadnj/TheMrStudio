#!/usr/bin/env python3
"""PreToolUse guards used only inside subagents (wired in .claude/agents/*.md frontmatter).

    subagent_guards.py readonly-bash   # code-reviewer, security-auditor: read-only commands
    subagent_guards.py tests-only      # test-writer Edit/Write: only tests/**
    subagent_guards.py tests-bash      # test-writer Bash: only run vitest on tests/

Allowlists, not denylists. Exit 2 blocks; stderr is shown to the subagent.
Any crash blocks the call (fail closed).
"""

from __future__ import annotations

import json
import os
import re
import shlex
import sys
from pathlib import Path
from typing import Any, cast

# No pipes, redirects, chaining, substitution or line breaks.
CHAINING = re.compile(r"[;&|`<>\n\r]|\$\(")
READONLY_COMMANDS: dict[tuple[str, ...], frozenset[str]] = {
    # command prefix -> allowed (non-positional) flags; positional args are always allowed
    ("git", "diff"): frozenset({"--stat", "--staged", "--cached", "--name-only", "-U0", "-U3"}),
    ("git", "log"): frozenset({"--oneline", "--stat", "-p", "--follow", "--name-only"}),
    ("git", "show"): frozenset({"--stat", "--name-only", "--oneline"}),
    ("git", "status"): frozenset({"--short", "-s", "--porcelain"}),
    ("git", "blame"): frozenset({"-L"}),
    ("git", "ls-files"): frozenset(),
    ("git", "rev-parse"): frozenset({"HEAD", "--abbrev-ref", "--show-toplevel"}),
    ("npm", "ls"): frozenset({"--depth", "--omit=dev", "--all"}),
    ("npm", "view"): frozenset(),
    ("npm", "audit"): frozenset({"--omit=dev", "--json"}),
    ("ls",): frozenset({"-l", "-la", "-a"}),
    ("wc",): frozenset({"-l"}),
    ("pwd",): frozenset(),
}
WRITABLE_PREFIXES = (("tests",),)
VITEST_FLAGS = frozenset({"--reporter=dot", "--reporter=verbose", "-t", "--bail=1", "--coverage"})


def _tool_input(payload: dict[str, Any]) -> dict[str, Any]:
    raw = payload.get("tool_input")
    if not isinstance(raw, dict):
        raise ValueError("tool_input is not an object")  # fail closed via main()
    return cast(dict[str, Any], raw)


def _command(payload: dict[str, Any]) -> str:
    return str(_tool_input(payload).get("command", "")).strip()


def readonly_bash(payload: dict[str, Any]) -> str | None:
    command = _command(payload)
    if CHAINING.search(command):
        return "read-only agent: no pipes, redirects, chaining, substitution or newlines."
    tokens = shlex.split(command)
    for prefix, flags in READONLY_COMMANDS.items():
        if tuple(tokens[: len(prefix)]) != prefix:
            continue
        for tok in tokens[len(prefix) :]:
            # -n10 / -10 style counts are fine; anything else option-like must be listed
            if tok == "--":
                continue
            if tok.startswith("-") and tok not in flags and not re.fullmatch(r"-n?\d+", tok):
                return f"read-only agent: option `{tok}` is not allowed for `{' '.join(prefix)}`."
            if "=" in tok and not tok.startswith("-"):
                return "read-only agent: NAME=VALUE arguments are not allowed."
        return None
    return f"read-only agent: `{command[:60]}` is not on the read-only allowlist."


def tests_only(payload: dict[str, Any]) -> str | None:
    tool_input = _tool_input(payload)
    file_path = tool_input.get("file_path") or tool_input.get("notebook_path")
    if not file_path:
        return None
    project = Path(os.environ.get("CLAUDE_PROJECT_DIR") or str(payload.get("cwd") or "."))
    try:
        rel = Path(str(file_path)).resolve().relative_to(project.resolve())
    except ValueError:
        return "test-writer may only write inside this project."
    if any(rel.parts[: len(p)] == p for p in WRITABLE_PREFIXES):
        return None
    return f"test-writer must not modify {rel}. Only tests/**."


def tests_bash(payload: dict[str, Any]) -> str | None:
    command = _command(payload)
    if CHAINING.search(command):
        return "test-writer: no pipes, redirects, chaining, substitution or newlines."
    tokens = shlex.split(command)
    if tokens in (["make", "test-fast"], ["make", "test"]):
        return None
    if tokens[:3] != ["npx", "vitest", "run"]:
        return "test-writer may only run `npx vitest run <tests/...>` or `make test-fast`."
    expect_value = False
    for tok in tokens[3:]:
        if expect_value:
            expect_value = False
            continue
        if tok in VITEST_FLAGS:
            expect_value = tok == "-t"
            continue
        if not tok.startswith("tests/"):
            return f"test-writer: vitest argument `{tok}` not allowed (only tests/... paths)."
    return None


GUARDS = {"readonly-bash": readonly_bash, "tests-only": tests_only, "tests-bash": tests_bash}


def main(argv: list[str]) -> int:
    if len(argv) != 2 or argv[1] not in GUARDS:
        print(f"usage: subagent_guards.py {{{','.join(GUARDS)}}}", file=sys.stderr)
        return 2
    payload: dict[str, Any] = json.loads(sys.stdin.read())
    reason = GUARDS[argv[1]](payload)
    if reason:
        print(f"BLOCKED by scripts/hooks/subagent_guards.py: {reason}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except Exception as exc:  # fail closed
        print(f"BLOCKED: subagent_guards crashed ({type(exc).__name__}: {exc})", file=sys.stderr)
        sys.exit(2)
