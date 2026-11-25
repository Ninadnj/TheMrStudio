#!/usr/bin/env python3
"""PreToolUse(Bash): block dangerous shell commands before they run.

- deny -> exit 2, stderr is shown to Claude as the reason.
- ask  -> JSON permissionDecision "ask": the user approves or rejects in the UI.
- Any crash in this script blocks the command (fail closed).

Best effort, not a sandbox: shell is too expressive to parse completely. It catches the
forms agents actually produce plus known bypasses (tests/hooks/test_pre_bash_guard.py).
For a hard boundary, enable Claude Code's sandbox. permissions.deny in settings.json is a
second, weaker layer.
"""

from __future__ import annotations

import json
import re
import shlex
import subprocess
import sys

Verdict = tuple[str, str]  # ("deny" | "ask", reason)

WRAPPERS = {
    "command", "builtin", "exec", "nohup", "time", "nice", "noglob", "env", "xargs",
    "timeout", "stdbuf", "ionice", "chronic",
}  # fmt: skip
# Per wrapper: options that consume the next token (nice -n 5, timeout -s KILL, xargs -I {}).
WRAPPER_OPTS_WITH_VALUE: dict[str, set[str]] = {
    "nice": {"-n", "--adjustment"},
    "timeout": {"-s", "-k", "--signal", "--kill-after"},
    "xargs": {"-I", "-L", "-P", "-d", "-E", "-n", "-s", "-a"},
    "stdbuf": {"-i", "-o", "-e"},
    "ionice": {"-c", "-n", "-p"},
    "env": {"-u", "-C", "-S", "--unset", "--chdir"},
}
PRIVILEGE = {"sudo", "doas", "su", "pkexec", "runas"}
SHELLS = {"sh", "bash", "zsh", "dash", "ksh", "fish"}
PROTECTED_BRANCHES = {"main", "master"}
GIT_OPTS_WITH_VALUE = {"-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env"}
PUSH_OPTS_WITH_VALUE = {"-o", "--push-option", "--repo", "--receive-pack", "--exec"}

SEGMENT_SPLIT = re.compile(r"\|\||&&|;|\||&|\n|\r|\$\(|`|\(|\)")
PIPE_TO_SHELL = re.compile(
    r"\b(curl|wget)\b[^|]*\|\s*(sudo\s+)?(env\s+)?"
    r"(sh|bash|zsh|dash|ksh|python3?|perl|ruby|node)\b"
)
SHELL_FROM_DOWNLOAD = re.compile(r"\b(sh|bash|zsh|source|\.)\s+<\(\s*(curl|wget)\b")
EVAL_DOWNLOAD = re.compile(r"\beval\b.*\$\(\s*(curl|wget)\b")
# .env, .env.local, x/.ENV ... but not .env.example. Case-insensitive (macOS filesystems).
SECRET_PATH = re.compile(r"(^|[\s/'\"=<>:])\.env(\.(?!example\b)[\w.-]+)?(?![\w.-])", re.I)
SECRETS_DIR = re.compile(r"(^|[\s/'\"=<>:])secrets/", re.I)
# Globs on a dotfile that could expand to .env: `.e?v`, `.en*`, `.[e]nv`, `.*`
SECRET_GLOB = re.compile(r"(^|/)\.[^/\s]*[?*\[]")
SHORT_CLUSTER = re.compile(r"-[a-zA-Z]+")

# ---- MR Studio rules (matched against the unwrapped command) -------------------------------
PROJECT_RULES: list[tuple[re.Pattern[str], str, str]] = [
    (
        re.compile(r"^(npm|pnpm|yarn) run db:push\b|^(npx )?drizzle-kit (push|drop)\b"),
        "deny",
        "db:push is `drizzle-kit push --force` and can drop production tables. Tables are "
        "created/seeded by the server on start-up (DatabaseStorage.ensureContent); see docs/DEPLOY.md.",
    ),
    (
        re.compile(r"^(ssh|scp|sftp|rsync)\b"),
        "ask",
        "remote access (the production droplet?): deploys are manual and need Nina's OK. "
        "See docs/DEPLOY.md.",
    ),
    (
        re.compile(r"^docker (compose|volume|system)\b.*\b(down|rm|prune)\b"),
        "ask",
        "this can delete containers or the uploads volume: confirm.",
    ),
]


def _tokens(segment: str) -> list[str]:
    try:
        return shlex.split(segment, posix=True)
    except ValueError:
        return segment.split()


def _strip_prefix(tokens: list[str]) -> list[str]:
    """Drop env assignments and wrappers incl. their options: `env -i nice -n 5 git push`."""
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        base = tok.rsplit("/", 1)[-1]
        if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*=.*", tok):
            i += 1
            continue
        if base not in WRAPPERS:
            break
        i += 1
        while i < len(tokens) and tokens[i].startswith("-") and tokens[i] != "-":
            opt = tokens[i]
            i += 1
            if opt in WRAPPER_OPTS_WITH_VALUE.get(base, set()):
                i += 1
        if base == "timeout" and i < len(tokens) and re.fullmatch(r"[\d.]+[smhd]?", tokens[i]):
            i += 1
    return tokens[i:]


def _current_branch() -> str:
    try:
        out = subprocess.run(
            ["git", "branch", "--show-current"], capture_output=True, text=True, timeout=5
        )
    except (OSError, subprocess.SubprocessError):
        return ""
    return out.stdout.strip()


def _split_git(args: list[str]) -> tuple[list[str], str, list[str]]:
    """git [global opts] <sub> [rest] -> (global opts incl. values, sub, rest)."""
    i = 0
    while i < len(args) and args[i].startswith("-"):
        i += 2 if args[i] in GIT_OPTS_WITH_VALUE else 1
    if i >= len(args):
        return args, "", []
    return args[:i], args[i], args[i + 1 :]


def _skips_verify(sub: str, rest: list[str]) -> bool:
    for a in rest:
        # git accepts unique prefixes (--no-veri); --no-v alone is ambiguous with --no-verbose
        if a.startswith("--no-v") and not "--no-verbose".startswith(a):
            return True
        if sub == "commit" and SHORT_CLUSTER.fullmatch(a) and "n" in a[1:]:
            return True
    return False


def _check_push(rest: list[str]) -> Verdict | None:
    positional: list[str] = []
    repo_given = False
    i = 0
    while i < len(rest):
        a = rest[i]
        if a.startswith("--force") or a == "--mirror" or a.startswith("+"):
            return "deny", "force-push rewrites shared history. Ask the user to do it."
        if SHORT_CLUSTER.fullmatch(a) and "f" in a[1:]:
            return "deny", "force-push rewrites shared history. Ask the user to do it."
        if a in {"--all", "--branches"}:
            return "deny", "--all pushes every branch, including main. Push one branch."
        if a.startswith("--repo"):
            repo_given = True
        if a in PUSH_OPTS_WITH_VALUE:
            i += 2
            continue
        if not a.startswith("-"):
            positional.append(a)
        i += 1
    refs = positional if repo_given else positional[1:]
    targets = {r.split(":")[-1].removeprefix("refs/heads/") for r in refs}
    if targets & PROTECTED_BRANCHES:
        return "deny", "pushing to main/master directly is not allowed. Push a branch + PR."
    if (not refs or "HEAD" in targets) and _current_branch() in PROTECTED_BRANCHES:
        return "deny", "you are on main/master; this push would update it. Create a branch."
    return None


def _check_git(args: list[str]) -> Verdict | None:
    global_opts, sub, rest = _split_git(args)
    if any("hookspath" in o.lower() for o in global_opts):
        return "deny", "overriding core.hooksPath skips the pre-commit gate."
    if _skips_verify(sub, rest):
        return "deny", "--no-verify skips the pre-commit gate (make check-fast). Fix the failure."
    if sub == "push":
        return _check_push(rest)
    if sub == "reset" and "--hard" in rest:
        return "deny", "git reset --hard discards uncommitted work. Ask the user first."
    if sub == "clean" and any(SHORT_CLUSTER.fullmatch(a) and "f" in a for a in rest):
        return "deny", "git clean -f deletes untracked files permanently. Ask the user first."
    return None


def _check_rm(args: list[str]) -> Verdict | None:
    flags = "".join(a.lstrip("-") for a in args if SHORT_CLUSTER.fullmatch(a))
    recursive = bool(re.search(r"[rR]", flags)) or "--recursive" in args
    force = "f" in flags or "--force" in args
    if recursive and force:
        return "deny", "rm -rf is blocked. Delete specific files, or ask the user to run it."
    if recursive:
        return "ask", "recursive delete: confirm the paths."
    return None


def _check_secrets(text: str, tokens: list[str]) -> Verdict | None:
    joined = " ".join(tokens)  # shlex undoes quoting tricks: ".en"v, .en\v -> .env
    for candidate in (text, joined):
        if SECRET_PATH.search(candidate) or SECRETS_DIR.search(candidate):
            return "deny", "commands touching .env*/secrets/ are blocked (.env.example is fine)."
    if any(SECRET_GLOB.search(t) for t in tokens):
        return "deny", "a glob on a dotfile could expand to .env. Name the file explicitly."
    return None


def check_segment(segment: str, depth: int = 0) -> Verdict | None:
    raw_tokens = _tokens(segment)
    secret = _check_secrets(segment, raw_tokens)
    if secret:
        return secret
    tokens = _strip_prefix(raw_tokens)
    if not tokens:
        return None
    cmd, args = tokens[0].rsplit("/", 1)[-1], tokens[1:]
    if cmd in PRIVILEGE:
        return "deny", f"{cmd} is not allowed from the agent. Ask the user to run it."
    unwrapped = " ".join([cmd, *args])
    for pattern, kind, reason in PROJECT_RULES:
        if pattern.search(unwrapped):
            return kind, reason
    if depth >= 3 and (cmd in SHELLS or cmd == "eval"):
        return "deny", "too many nested shells to inspect."
    if cmd in SHELLS:
        for idx, a in enumerate(args):  # -c, -lc, -ec ...: the next non-option is the script
            if SHORT_CLUSTER.fullmatch(a) and "c" in a[1:]:
                script = next((x for x in args[idx + 1 :] if not x.startswith("-")), "")
                return check_command(script, depth + 1)
    if cmd == "eval":
        return check_command(" ".join(args), depth + 1)
    if cmd == "rm":
        return _check_rm(args)
    if cmd == "find" and any(a in {"-delete", "-exec", "-execdir", "-ok"} for a in args):
        return "ask", "find with -delete/-exec can modify many files: confirm."
    if cmd == "git":
        return _check_git(args)
    return None


def check_command(command: str, depth: int = 0) -> Verdict | None:
    if PIPE_TO_SHELL.search(command) or SHELL_FROM_DOWNLOAD.search(command):
        return "deny", "piping a download into a shell/interpreter runs unreviewed code."
    if EVAL_DOWNLOAD.search(command):
        return "deny", "eval of downloaded content runs unreviewed code."
    asked: Verdict | None = None
    for segment in SEGMENT_SPLIT.split(command):
        verdict = check_segment(segment.strip(), depth)
        if verdict and verdict[0] == "deny":
            return verdict
        asked = asked or verdict
    return asked


def main() -> int:
    payload = json.loads(sys.stdin.read())
    command = str(payload["tool_input"]["command"])
    verdict = check_command(command)
    if verdict is None:
        return 0
    kind, reason = verdict
    if kind == "ask":
        decision = {
            "hookEventName": "PreToolUse",
            "permissionDecision": "ask",
            "permissionDecisionReason": f"pre_bash_guard: {reason}",
        }
        print(json.dumps({"hookSpecificOutput": decision}))
        return 0
    print(f"BLOCKED by scripts/hooks/pre_bash_guard.py: {reason}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # fail closed: a broken guard must not let commands through
        print(f"BLOCKED: pre_bash_guard crashed ({type(exc).__name__}: {exc})", file=sys.stderr)
        sys.exit(2)
